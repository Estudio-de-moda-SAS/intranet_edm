import { TeamMember } from "./types";
import TeamMemberCard from "./TeamMemberCard";

interface Props {
  members: TeamMember[];
}

export default function TeamGrid({ members }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-4 w-full">
      {members.map((member, index) => (
        <div key={member.id} className="w-56 shrink-0">
          <TeamMemberCard member={member} index={index} />
        </div>
      ))}
    </div>
  );
}
