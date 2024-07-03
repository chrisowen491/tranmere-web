"use client";
import { useState } from "react";

export function PlayerAvatarBuilder() {
  const base = "https://www.tranmere-web.com/builder/";
  const [img, setImg] = useState(
    "1966/simple/ffd3b3/none/000000/fcb98b/LightGray/8e740c",
  );

  const onSubmit = async (formData: FormData) => {
    setImg(
      `${formData.get("kit")}/${formData.get("hair")}/${formData.get("skinColour")}/${formData.get("feature")}/${formData.get("colour")}/${formData.get("neckColour")}/${formData.get("background")}/${formData.get("highlights")}`,
    );
  };

  return (
    <div className="container overlay-item-top">
      <div className="row">
        <div className="col">
          <div className="content boxed">
            <div className="row separated">
              <aside className="col-md-3 content-aside bg-light">
                <div className="widget">
                  <form action={onSubmit}>
                    <h3 className="widget-title">Filter</h3>
                    <div className="form-group">
                      <label htmlFor="kit">Kit</label>
                      <select
                        className="form-control form-control-sm"
                        id="kit"
                        name="kit"
                      >
                        <option value="1966">1966-68 Home</option>
                        <option value="1977">1977-78 Home</option>
                        <option value="1979">1979-80 Home</option>
                        <option value="1980">1980-81 Home</option>
                        <option value="1981">1981-82 Home</option>
                        <option value="1982">1982-83 Home</option>
                        <option value="1983">1983-85 Home</option>
                        <option value="1985">1985-86 Home</option>
                        <option value="1986">1986-87 Home</option>
                        <option value="1987">1987-88 Home</option>
                        <option value="1988">1988-89 Home</option>
                        <option value="1989">1989-91 Home</option>
                        <option value="1989A">1989-91 Away</option>
                        <option value="1991">1991-93 Home</option>
                        <option value="1991gk">1991-93 GK</option>
                        <option value="1993">1993-95 Home</option>
                        <option value="1995">1995-97 Home</option>
                        <option value="1997">1997-99 Home</option>
                        <option value="1999">1999-00 Home</option>
                        <option value="1999gk">1999-00 GK</option>
                        <option value="2000">2000-02 Home</option>
                        <option value="2002">2002-04 Home</option>
                        <option value="2004">2004-06 Home</option>
                        <option value="2006">2006-07 Home</option>
                        <option value="2007">2007-09 Home</option>
                        <option value="2007gk">2007-09 GK</option>
                        <option value="2009">2009-10 Home</option>
                        <option value="2010">2010-11 Home</option>
                        <option value="2010gk">2010-11 GK</option>
                        <option value="2011">2011-12 Home</option>
                        <option value="2012">2012-13 Home</option>
                        <option value="2012gk">2012-13 GK</option>
                        <option value="2013">2013-14 Home</option>
                        <option value="2014">2014-15 Home</option>
                        <option value="2015">2015-16 Home</option>
                        <option value="2016">2016-17 Home</option>
                        <option value="2016gk">2016-17 GK</option>
                        <option value="2016A">2016-17 Away</option>
                        <option value="2017">2017-18 Home</option>
                        <option value="2017A">2017-18 Away</option>
                        <option value="2018A">2018-19 Away</option>
                        <option value="2018">2018-19 Home</option>
                        <option value="2019">2019-00 Home</option>
                        <option value="2020">2020-21 Home</option>
                        <option value="2020A">2020-21 Away</option>
                        <option value="2020gk">2020-21 GK</option>
                        <option value="2021">2021-22 Home</option>
                        <option value="2021A">2021-22 Away</option>
                        <option value="2021T">2021-22 Third</option>
                        <option value="2021gk">2021-22 GK</option>
                        <option value="2022">2022-22 Home</option>
                        <option value="2022A">2022-22 Away</option>
                        <option value="2022gk">2022-22 GK</option>
                        <option value="2023">2023-24 Home</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="skinColour">Skin Colour</label>
                      <select
                        className="form-control form-control-sm"
                        id="skinColour"
                        name="skinColour"
                      >
                        <option>ffd3b3</option>
                        <option>7f3f00</option>
                        <option>edc595</option>
                        <option>c49358</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="neckColour">Neck Shadow</label>
                      <select
                        className="form-control form-control-sm"
                        id="neckColour"
                        name="neckColour"
                      >
                        <option>fcb98b</option>
                        <option>5b2d01</option>
                        <option>bfa482</option>
                        <option>8e7354</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="hair">Hair Shape</label>
                      <select
                        className="form-control form-control-sm"
                        id="hair"
                        name="hair"
                      >
                        <option>simple</option>
                        <option>short</option>
                        <option>widows-peak</option>
                        <option>side-parting</option>
                        <option>side-parting-left</option>
                        <option>side-parting-small</option>
                        <option>side-parting-left-small</option>
                        <option>balding-combed-forward</option>
                        <option>middle-parting</option>
                        <option>bald</option>
                        <option>balding</option>
                        <option>balding-buzzcut</option>
                        <option>buzzcut</option>
                        <option>combed-back</option>
                        <option>beard</option>
                        <option>mousse</option>
                        <option>bushy</option>
                        <option>scruffy</option>
                        <option>extra-scruffy</option>
                        <option>bowl</option>
                        <option>thick</option>
                        <option>greying</option>
                        <option>curly</option>
                        <option>slick</option>
                        <option>stylish</option>
                        <option>receeding</option>
                        <option>side-parting-curl</option>
                        <option>droopy-fringe</option>
                        <option>curtains</option>
                        <option>high-forehead</option>
                        <option>dreads</option>
                        <option>eighties</option>
                        <option>big-curly</option>
                        <option>mullit</option>
                        <option>square</option>
                        <option>morgan</option>
                        <option>dadi</option>
                        <option>connor</option>
                        <option>lloyd</option>
                        <option>lewis</option>
                        <option>morrissey</option>
                        <option>mickey</option>
                        <option>george</option>
                        <option>calvin</option>
                        <option>frank</option>
                        <option>derek</option>
                        <option>les</option>
                        <option>liam</option>
                        <option>jason</option>
                        <option>kenny</option>
                        <option>jimmy</option>
                        <option>manny</option>
                        <option>steve</option>
                        <option>jim</option>
                        <option>stuart</option>
                        <option>dickie</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="colour">Hair Colour</label>
                      <select
                        className="form-control form-control-sm"
                        id="colour"
                        name="colour"
                      >
                        <option value="000000">Black</option>
                        <option value="7f3f00">Brown</option>
                        <option value="bc9d00">Blonde</option>
                        <option value="bc6a21">Light Brown</option>
                        <option value="666666">Gray</option>
                        <option value="0000ff">Baz-Blue</option>
                        <option value="512904">Dark Brown</option>
                        <option value="efef64">Yellow</option>
                        <option value="cccccc">Silver</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="highlights">Hair Highlights Colour</label>
                      <select
                        className="form-control form-control-sm"
                        id="highlights"
                        name="highlights"
                      >
                        <option value="8e740c">Brown</option>
                        <option value="bc8a00">Blonde</option>
                        <option value="562a01">Dark Brown</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="feature">Feature</label>
                      <select
                        className="form-control form-control-sm"
                        id="feature"
                        name="feature"
                      >
                        <option>none</option>
                        <option>stubble</option>
                        <option>mustache</option>
                        <option>thick-tache</option>
                        <option>chin-stubble</option>
                        <option>whisper-of-a-mustache</option>
                        <option>small-beard</option>
                        <option>small-beard-shadow</option>
                        <option>shadow</option>
                        <option>brows</option>
                        <option>quiff</option>
                        <option>droopy-hair</option>
                        <option>fringe</option>
                        <option>parting</option>
                        <option>combed-bit</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="background">Background Colour</label>
                      <select
                        className="form-control form-control-sm"
                        id="background"
                        name="background"
                      >
                        <option value="LightGray">LightGray</option>
                        <option value="White">White</option>
                        <option value="none">Transparent</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary btn-rounded btn-player-builder"
                    >
                      Search
                    </button>
                  </form>
                </div>
              </aside>
              <article className="col-md-9 content-body">
                <div id="builder">
                  <div className="row">
                    <div className="col-6">
                      <div className="row gutter-2">
                        <div className="col">
                          <img width="350px" src={`${base}${img}`} />
                          <h4>
                            Link: <a href={`${base}${img}`}>here</a>
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="row gutter-2">
                        <div className="col">
                          <img width="100px" src={`${base}${img}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
