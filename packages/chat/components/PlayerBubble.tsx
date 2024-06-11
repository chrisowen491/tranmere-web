import { ExtendedMessage } from "./Types";

export function PlayerBubble(props: { message: ExtendedMessage}) {
  return (
    <div className="row justify-content-center justify-content-lg-start gutter-2 player-of-day ">
        <div className="col-lg-12 col-md-12 col-sm-12">
            <div className="card stacked">
                <div className="card-body bg-blue" style={{ backgroundImage: "url(" + `${props.message.player?.picLink.fields.file.url}` + ")"}}>
                    <div className="row gutter-2 align-items-center">
                        <div className="col" itemProp="member">
                            <h3 className="font-weight-normal mb-2">{props.message.player?.Player}</h3>
                            <p className="card-text mb-2">{props.message.player?.Apps} apps</p>
                            <p className="card-text mb-2">{props.message.player?.goals} goals</p>
                            <a href="https://www.tranmere-web.com/page/player/{props.message.player?.Player}" className="action mt-1 text-blue">View Profile</a>
                        </div>
                    </div>
                </div>
            </div>                                     
        </div>  
    </div>
  );
}