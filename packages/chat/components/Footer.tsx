"use client";

import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  return (
    
    <footer className="site-footer">
        <div className="container">
            <div className="row gutter-3">
                <div className="col-12 col-md-2">
                    <a href="/"><img src="https://www.tranmere-web.com/assets/images/logo_white_transparent.png" alt="Logo" /></a>
                </div>
                <div className="col-12 col-md-6 text-white">
                    <div className="row">
                        <div className="col">
                            <ul className="list-group list-group-minimal">
                                <li className="list-group-item"><a href="/about" className="link">About the site</a></li>
                                <li className="list-group-item"><a href="https://github.com/chrisowen491/tranmere-web" className="link">Sourcecode</a></li>
                                <li className="list-group-item"><a href="/contact" className="link">Contact Us</a></li>
                                <li className="list-group-item"><a href="https://portal.tranmere-web.com/" className="link">API</a></li>
                                <li className="list-group-item"><button id="loginout" type="button" className="btn btn-link">Sign-In</button></li>

                                <li className="list-group-item"><p className="mb-4">© Tranmere-Web 2020</p></li>
                            </ul>
                        </div>
                        <div className="col">
                            <ul className="list-group list-group-minimal">

                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4 col-lg-2 ml-auto text-md-right">
                </div>
            </div>
        </div>
    </footer>
  );
}