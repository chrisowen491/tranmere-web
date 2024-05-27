import { PlayerSeasonSummary } from "@/app/api/chat/agents/types";
import type { Message } from "ai/react";
import type { AgentStep } from "langchain/agents";

export function IntermediateStep(props: { message: Message, aiEmoji?: string, sources: any[] }) {
  const parsedInput: AgentStep = JSON.parse(props.message.content);
  const observation = JSON.parse(parsedInput.observation) as PlayerSeasonSummary;
  const colorClassName = "bg-blue text-white";
  const alignmentClassName = "mr-auto";
  const prefix = props.aiEmoji;
  return (
    <div className="row justify-content-center justify-content-lg-start gutter-2 player-of-day">
      <div className="col-lg-12 col-md-12 col-sm-12">
          <div className="card stacked" itemScope itemType ="https://schema.org/SportsTeam">
              <meta itemProp="name" content="Tranmere Rovers" />
              <div className="card-body" style={{backgroundImage: "url(" + observation.bio?.picLink + ")"}}>
                  <div className="row gutter-2 align-items-center">
                      <div className="col" itemProp="member" itemScope itemType="https://schema.org/athlete">
                          <meta itemProp="image" content="{{randomplayer.picLink}}" />
                          <h3 className="font-weight-normal mb-2">Player Of The Day</h3>
                          <h4 className="font-weight-normal mb-3" itemProp="name">{observation.Player}</h4>
                          <p className="card-text mb-2">{observation.Apps} apps</p>
                          <p className="card-text mb-2">{observation.goals} goals</p>
                          <a href="/page/player/{{randomplayer.name}}" className="action mt-1 text-blue">View Profile</a>
                      </div>
                  </div>
              </div>
          </div>                                     
      </div>          
  </div>
  );
}