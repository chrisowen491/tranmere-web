import { SideBar } from "@/components/sidebar/SideBar";
import Search from "./Search";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tranmere-Web: A Tranmere Rovers fansite",
  description: "Tranmere-Web.com is a website full of data, statistics and information about Tranmere Rovers FC",
  openGraph: {
    title: "Tranmere-Web: A Tranmere Rovers fansite",
    type: "website",
    images: "/assets/images/square_v1.png",
    url: "https://www.tranmere-web.com/"
  },
};

export default async function Home() {

  return (
    <>
        <Navbar showSearch={false}></Navbar>
        <section className="hero bg-blue overlay home-hero">
            <div className="container">
                <div className="row align-items-end justify-content-between">
                    <div className="col-sm-12 col-md-6 text-white mb-3 mb-md-0">
                        <div className="row gutter-2">
                            <div className="col-12">
                                <h1 className="h3 font-weight-normal">Welcome To Tranmere Web!</h1>
                            </div>
                            <div className="col-12">
                                <h2 className="h4">The website full of data, statistics and information about Tranmere Rovers FC</h2>
                            </div>
                        </div>
                    </div>
                    <div className="co-sm-12 col-md-6">
                        <img src="https://www.tranmere-web.com/builder/1989/side-parting-left-small/ffd3b3/none/bc9d00/fcb98b/none/bc8a00" alt="Image" className="overlay-item-bottom" />
                    </div>
                </div>
                <div className="row gutter-2">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body py-2">
                              <Search />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-white" style={{paddingTop:"10px"}}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="content boxed">
                            <div className="row separated">

                                <SideBar></SideBar>
                                <article className="col-md-8 content-body">    
                                    
                                    <h2>Frequently Asked Questions</h2>
                                    <div className="accordion accordion-stack" id="accordionExample">
                                        <div className="card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                        <div className="card-header" id="headingOne">
                                            <h5 className="mb-0">
                                            <button className="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne" itemProp="name">
                                                Can I create my own player avatar?
                                            </button>
                                            </h5>
                                        </div>
                
                                        <div id="collapseOne" className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                            <div className="card-body" itemProp="text">
                                            Yes, checkout the custom tool for customizing you own avatar <a href="https://www.tranmere-web.com/player-builder">here</a>
                                            </div>
                                        </div>
                                        </div>
                                        <div className="card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                        <div className="card-header" id="headingTwo">
                                            <h5 className="mb-0">
                                            <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" itemProp="name">
                                                Do you have every Tranmere Rovers result?
                                            </button>
                                            </h5>
                                        </div>
                                        <div id="collapseTwo" className="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                            <div className="card-body" itemProp="text">
                                            We have all first team results since 1921. With appearance and goal data since 1977. Assist data is patchy since it is not definitively recorded.
                                            </div>
                                        </div>
                                        </div>
                                        <div className="card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                        <div className="card-header" id="headingThree">
                                            <h5 className="mb-0">
                                            <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" itemProp="name">
                                                How are match reports written?
                                            </button>
                                            </h5>
                                        </div>
                                        <div id="collapseThree" className="collapse" aria-labelledby="headingThree" data-parent="#accordionExample" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                            <div className="card-body" itemProp="text">
                                            All our match reports are written using Generative AI.
                                            </div>
                                        </div>
                                        </div>
                                        <div className="card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                        <div className="card-header" id="headingFour">
                                            <h5 className="mb-0">
                                            <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseFour" aria-expanded="false" aria-controls="collapseFour" itemProp="name">
                                                Where do you get your results information?
                                            </button>
                                            </h5>
                                        </div>
                                        <div id="collapseFour" className="collapse" aria-labelledby="headingFour" data-parent="#accordionExample" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                            <div className="card-body" itemProp="text">
                                            Results data is primarily sourced from James P. Curley (2016). engsoccerdata: English Soccer Data 1871-2016 on <a href="https://github.com/jalapic/engsoccerdata/">GitHub</a>. Player apperance data is from various books and internet sources.
                                            </div>
                                        </div>
                                        </div>
                                    
                                        <div className="card" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                                            <div className="card-header" id="headingFive">
                                            <h5 className="mb-0">
                                                <button className="btn btn-link collapsed" type="button" data-toggle="collapse" data-target="#collapseFive" aria-expanded="false" aria-controls="collapseFive" itemProp="name">
                                                Where do the programme pictures come from?
                                                </button>
                                            </h5>
                                            </div>
                                            <div id="collapseFive" className="collapse" aria-labelledby="headingFive" data-parent="#accordionExample" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                                            <div className="card-body" itemProp="text">
                                                I have scanned these in from my own personal collection. There are over 2000 programme covers, including nearly every home game since 1960 (missing about 20!).
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
        </section>
        <Footer></Footer>
    </>
  );
}
