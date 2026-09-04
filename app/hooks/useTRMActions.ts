import { DollarSign, Euro, PoundSterling } from "lucide-react";
import React from "react";
import { ElementType, useState } from "react";

export interface TrmCurrency {
  code: string;
  name: string;
  value: string;
  /** Variación porcentual frente al día anterior, ya formateada (ej. "+12,50%" / "-5,20%"). */
  change: string;
  /** Variación en pesos frente al día anterior, ya formateada (ej. "+$ 45,32" / "-$ 12,10"). */
  changeValue: string;
  trend: "up" | "down" | "neutral";
  icon: ElementType;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

interface TrmApiResponse {
  vigenciadesde: string;
  valor: string;
  unidad: string;
  vigenciahasta: string;
}

interface EurGbpApiResponse {
  amount: number;
  base: string;
  date: string;
  rates: {
    "EUR": number;
    "GBP": number;
  };
}


const trmUsdUrl = "https://www.datos.gov.co/resource/32sa-8pi3.json";


export function useTRMActions() {
  const [concurrences, setConcurrences] = useState<TrmCurrency[]>([]);

  const upsertConcurrence = (currency: TrmCurrency) => {
    setConcurrences(prev => [...prev.filter(c => c.code !== currency.code), currency]);
  };

  const formatChangeValue = (diff: number) => {
    const sign = diff >= 0 ? "+" : "-";
    return `${sign}$ ${Math.abs(diff).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fetchUSDConcurrences = async () => {
    const today = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato YYYY-MM-DD
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // Obtener la fecha de ayer en formato YYYY-MM-DD
    try{
      const response = await fetch(`${trmUsdUrl}?$order=vigenciadesde DESC&$limit=2`)  //Llamada a la API para obtener los datos de concurrencias
      const data = await response.json();

      if(!data) return

      const valorHoy = data.find((item: TrmApiResponse ) => item.vigenciadesde.slice(0, 10) === today);
      const valorAyer = data.find((item: TrmApiResponse ) => item.vigenciadesde.slice(0, 10) === yesterday);
      const cambio = ((valorHoy && valorAyer) ? 
        ((parseFloat(valorHoy.valor) - parseFloat(valorAyer.valor))/parseFloat(valorAyer.valor)*100).toFixed(2) : 
        "0.00"
      );

      upsertConcurrence({
          code: "USD",
          borderColor:"border-l-emerald-500",
          change: cambio + "%",
          changeValue: valorHoy && valorAyer ? formatChangeValue(parseFloat(valorHoy.valor) - parseFloat(valorAyer.valor)) : "$ 0.00",
          icon: DollarSign,
          iconBg: "bg-emerald-50 dark:bg-emerald-500/[0.12]",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          name: "Dólar estadounidense",
          trend: valorHoy && valorAyer ? (parseFloat(valorHoy.valor) > parseFloat(valorAyer.valor) ? "up" : "down") : "neutral",
          value: valorHoy ? `$ ${parseFloat(valorHoy.valor).toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$ 0.00",
        })
    } catch (error) {
      console.error("Error fetching USD concurrences:", error);
    }
  }

  const fetchEurAndGbp = async () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10); // Obtener la fecha de ayer en formato YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10); // Obtener la fecha actual en formato YYYY-MM-DD
    const todayEndpoint = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP";
    const yesterdayEndpoint = `https://api.frankfurter.dev/v1/${yesterday}?base=USD&symbols=EUR,GBP`;

    try{
      const [todayResponse, yesterdayResponse, trmData] = await Promise.all([
        fetch(todayEndpoint).then(res => res.json()) as Promise<EurGbpApiResponse>,
        fetch(yesterdayEndpoint).then(res => res.json()) as Promise<EurGbpApiResponse>,
        fetch(`${trmUsdUrl}?$order=vigenciadesde DESC&$limit=2`).then(res => res.json()) as Promise<TrmApiResponse[]>
      ]);

      if(!todayResponse?.rates || !yesterdayResponse?.rates || !trmData) {
        console.error("Error fetching EUR and GBP concurrences: Invalid response");
        return;
      }

      const trmHoy = trmData.find((item: TrmApiResponse) => item.vigenciadesde.slice(0, 10) === today);
      const trmAyer = trmData.find((item: TrmApiResponse) => item.vigenciadesde.slice(0, 10) === yesterday);
      const trmHoyValor = trmHoy ? parseFloat(trmHoy.valor) : null;
      const trmAyerValor = trmAyer ? parseFloat(trmAyer.valor) : null;

      // El valor en COP se deriva de la TRM oficial (COP/USD) y la tasa cruzada USD/EUR o USD/GBP.
      const eurHoy = trmHoyValor ? trmHoyValor / todayResponse.rates.EUR : null;
      const eurAyer = trmAyerValor ? trmAyerValor / yesterdayResponse.rates.EUR : null;
      const cambioEur = ((eurHoy && eurAyer) ?
        ((eurHoy - eurAyer) / eurAyer * 100).toFixed(2) :
        "0.00"
      );

      upsertConcurrence({
        code: "EUR",
        borderColor: "border-l-sky-500",
        change: cambioEur + "%",
        changeValue: eurHoy && eurAyer ? formatChangeValue(eurHoy - eurAyer) : "$ 0.00",
        icon: Euro,
        iconBg: "bg-sky-50 dark:bg-sky-500/[0.12]",
        iconColor: "text-sky-600 dark:text-sky-400",
        name: "Euro",
        trend: eurHoy && eurAyer ? (eurHoy > eurAyer ? "up" : "down") : "neutral",
        value: eurHoy ? `$ ${eurHoy.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$ 0.00",
      })

      const gbpHoy = trmHoyValor ? trmHoyValor / todayResponse.rates.GBP : null;
      const gbpAyer = trmAyerValor ? trmAyerValor / yesterdayResponse.rates.GBP : null;
      const cambioGbp = ((gbpHoy && gbpAyer) ?
        ((gbpHoy - gbpAyer) / gbpAyer * 100).toFixed(2) :
        "0.00"
      );

      upsertConcurrence({
        code: "GBP",
        borderColor: "border-l-violet-500",
        change: cambioGbp + "%",
        changeValue: gbpHoy && gbpAyer ? formatChangeValue(gbpHoy - gbpAyer) : "$ 0.00",
        icon: PoundSterling,
        iconBg: "bg-violet-50 dark:bg-violet-500/[0.12]",
        iconColor: "text-violet-600 dark:text-violet-400",
        name: "Libra esterlina",
        trend: gbpHoy && gbpAyer ? (gbpHoy > gbpAyer ? "up" : "down") : "neutral",
        value: gbpHoy ? `$ ${gbpHoy.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$ 0.00",
      })
    } catch (error) {
      console.error("Error fetching EUR and GBP concurrences:", error);
    }
  }

  const buildConcurrencesArray = React.useCallback(async () => {
    await Promise.all([fetchUSDConcurrences(), fetchEurAndGbp()]);
  }, []);



  return{
    concurrences, buildConcurrencesArray
  }
}