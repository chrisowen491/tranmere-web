"use client";

import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  return (
<header className="header header-sticky header-transparent" id="homenav">
    <div className="container">
        <div className="row">
            <nav className="navbar navbar-expand-lg navbar-dark">
                <div itemScope itemType="http://schema.org/Organization">
                    <a itemProp="url" href="https://www.tranmere-web.com" title="Tranmere-Web.com" className="navbar-brand"><img src="https://www.tranmere-web.com/assets/images/logo_white_transparent.png" alt="Tranmere-Web.com" itemProp="logo"/></a>
                </div>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="resultsNav" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                Results
                            </a>
                            <div className="dropdown-menu" aria-labelledby="resultsNav">
                                <a className="dropdown-item" href="https://www.tranmere-web.com/results">Results Home</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/games/at-wembley">Tranmere At Wembley</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/games/penalty-shootouts">Penalty Shootouts</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="playerNav" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                Players
                            </a>
                            <div className="dropdown-menu" aria-labelledby="playerNav">
                                <a className="dropdown-item" href="https://www.tranmere-web.com/playersearch">Players Home</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/player-records/most-appearances">Most Tranmere Appearances</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/player-records/top-scorers">Most Tranmere Goals</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/player-records/only-one-appearance">Only Played Once</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/top-scorers-by-season">Top Scorers By Season</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/hat-tricks">Hat Tricks</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/super-stars">Opposition Stars</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/transfer-central">Transfers</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="statsNav" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                Stats
                            </a>
                            <div className="dropdown-menu" aria-labelledby="statsNav">
                                <a className="dropdown-item" href="https://www.tranmere-web.com/page/blog/2VrsLTKALyi2vgAQMLDoIT">Stats Home</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/games/top-attendances">Highest Tranmere Attendances</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/games/top-home-attendances">Highest Tranmere Attendances at Prenton Park</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link dropdown-toggle" href="#" id="mediaNav" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                Media
                            </a>
                            <div className="dropdown-menu" aria-labelledby="mediaNav">
                                <a className="dropdown-item" href="https://www.tranmere-web.com/page/blog/7wtrOLaYqaK7Dhvodz1Gv0">Media Home</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/page/blog/7GNQCz3dEPOCvuyfcHTWvA">Books</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/page/blog/7gk4gmq9N6ibfree9KOl1j">Football Cards</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/page/blog/5uUGSyqn2uTrGx4c24mhly">Testimonials & Benefit Matches</a>
                                <a className="dropdown-item" href="https://www.tranmere-web.com/player-builder">Player Avatar Builder</a>
                            </div>
                        </li>
                        <li className="nav-item dropdown">
                            <a className="nav-link" href="https://chat.tranmere-web.com" id="chat" role="button"
                               aria-haspopup="false" aria-expanded="false">
                                Tranmere AI
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
</header>
  );
}