"use client";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import DOMPurify from "dompurify";

export function PlayerAvatarBuilder() {
  const base = "/builder/";
  const [kit, setKit] = useState("2026");
  const [hair, setHair] = useState("simple");
  const [skinColour, setSkinColour] = useState("ffd3b3");
  const [neckColour, setNeckColour] = useState("fcb98b");
  const [colour, setColour] = useState("000000");
  const [feature, setFeature] = useState("none");
  const [highlights, setHighlights] = useState("8e740c");
  const [background, setBackground] = useState("LightGray");
  const avatarUrl = `${base}${kit}/${hair}/${skinColour}/${feature}/${colour}/${neckColour}/${background}/${highlights}`;
  const labelClass =
    "block text-xs font-bold uppercase tracking-[0.14em] text-[#071a2b]/70";
  const selectClass =
    "mt-2 block w-full border border-[#071a2b]/20 bg-[#fffdf8] px-3 py-3 text-sm text-[#071a2b] shadow-none focus:border-blue-700 focus:ring-blue-700";

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-24 sm:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:px-12">
      <section
        aria-labelledby="preview-heading"
        className="border border-white/10 bg-[#071a2b] p-6 text-white lg:sticky lg:top-6 lg:order-2"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2
            id="preview-heading"
            className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300"
          >
            Live preview
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40">
            SVG · 512 × 512
          </span>
        </div>
        <div className="overflow-hidden border border-white/10 bg-[#e8e2d6]">
          <Image
            width={512}
            height={512}
            alt="Custom player avatar preview"
            unoptimized
            priority
            src={avatarUrl}
            className="aspect-square w-full object-cover"
          />
        </div>
        <Link
          href={avatarUrl}
          className="mt-5 flex items-center justify-between border border-white/20 px-4 py-3 text-sm font-bold transition hover:border-blue-300 hover:text-blue-300"
        >
          Open your SVG
          <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <section className="lg:order-1">
        <div className="border-t border-[#071a2b]/20 pt-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Customise
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold">
                Player details
              </h2>
            </div>
            <span className="font-mono text-xs text-[#071a2b]/40">
              8 controls
            </span>
          </div>
          <form>
            <div className="grid grid-cols-12 gap-x-4 gap-y-6">
              <div className="col-span-full sm:col-span-6">
                <label htmlFor="kit" className={labelClass}>
                  Kit
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="kit"
                    name="kit"
                    value={kit}
                    onChange={(e) => {
                      setKit(DOMPurify.sanitize(e.target.value));
                    }}
                  >
                    <option value="2026">2026-27 Home</option>
                    <option value="2026A">2026-27 Away</option>
                    <option value="2026gk">2026-27 GK</option>
                    <option value="2025">2025-26 Home</option>
                    <option value="2024">2024-25 Home</option>
                    <option value="2023">2023-24 Home</option>
                    <option value="2022">2022-23 Home</option>
                    <option value="2022A">2022-23 Away</option>
                    <option value="2022gk">2022-22 GK</option>
                    <option value="2021">2021-22 Home</option>
                    <option value="2021A">2021-22 Away</option>
                    <option value="2021T">2021-22 Third</option>
                    <option value="2021gk">2021-22 GK</option>
                    <option value="2020">2020-21 Home</option>
                    <option value="2020A">2020-21 Away</option>
                    <option value="2020gk">2020-21 GK</option>
                    <option value="2019">2019-00 Home</option>
                    <option value="2018">2018-19 Home</option>
                    <option value="2018A">2018-19 Away</option>
                    <option value="2017">2017-18 Home</option>
                    <option value="2017A">2017-18 Away</option>
                    <option value="2016">2016-17 Home</option>
                    <option value="2016A">2016-17 Away</option>
                    <option value="2016gk">2016-17 GK</option>
                    <option value="2015">2015-16 Home</option>
                    <option value="2014">2014-15 Home</option>
                    <option value="2013">2013-14 Home</option>
                    <option value="2012">2012-13 Home</option>
                    <option value="2012gk">2012-13 GK</option>
                    <option value="2011">2011-12 Home</option>
                    <option value="2010">2010-11 Home</option>
                    <option value="2010gk">2010-11 GK</option>
                    <option value="2009">2009-10 Home</option>
                    <option value="2007">2007-09 Home</option>
                    <option value="2007gk">2007-09 GK</option>
                    <option value="2006">2006-07 Home</option>
                    <option value="2004">2004-06 Home</option>
                    <option value="2002">2002-04 Home</option>
                    <option value="2000">2000-02 Home</option>
                    <option value="1999">1999-00 Home</option>
                    <option value="1999gk">1999-00 GK</option>
                    <option value="1997">1997-99 Home</option>
                    <option value="1995">1995-97 Home</option>
                    <option value="1993">1993-95 Home</option>
                    <option value="1991">1991-93 Home</option>
                    <option value="1991gk">1991-93 GK</option>
                    <option value="1989">1989-91 Home</option>
                    <option value="1989A">1989-91 Away</option>
                    <option value="1988">1988-89 Home</option>
                    <option value="1987">1987-88 Home</option>
                    <option value="1986">1986-87 Home</option>
                    <option value="1985">1985-86 Home</option>
                    <option value="1983">1983-85 Home</option>
                    <option value="1982">1982-83 Home</option>
                    <option value="1981">1981-82 Home</option>
                    <option value="1980">1980-81 Home</option>
                    <option value="1979">1979-80 Home</option>
                    <option value="1977">1977-78 Home</option>
                    <option value="1972">1972-74 Home</option>
                    <option value="1970">1970-71 Home</option>
                    <option value="1966">1966-68 Home</option>
                    <option value="1960">1957-62 Home</option>
                    <option value="1960gk">1960s GK</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="skinColour" className={labelClass}>
                  Skin
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="skinColour"
                    name="skinColour"
                    onChange={(e) => {
                      setSkinColour(DOMPurify.sanitize(e.target.value));
                    }}
                  >
                    <option>ffd3b3</option>
                    <option>7f3f00</option>
                    <option>edc595</option>
                    <option>c49358</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="neckColour" className={labelClass}>
                  Neck
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="neckColour"
                    name="neckColour"
                    onChange={(e) => {
                      setNeckColour(DOMPurify.sanitize(e.target.value));
                    }}
                  >
                    <option>fcb98b</option>
                    <option>5b2d01</option>
                    <option>bfa482</option>
                    <option>8e7354</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="hair" className={labelClass}>
                  Hair Shape
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="hair"
                    name="hair"
                    onChange={(e) => {
                      setHair(DOMPurify.sanitize(e.target.value));
                    }}
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
                    <option>feathered</option>
                    <option>high-forehead</option>
                    <option>dreads</option>
                    <option>zane-okoro</option>
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
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="colour" className={labelClass}>
                  Hair Colour
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="colour"
                    name="colour"
                    onChange={(e) => {
                      setColour(DOMPurify.sanitize(e.target.value));
                    }}
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
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="highlights" className={labelClass}>
                  Hair Highlights
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="highlights"
                    name="highlights"
                    onChange={(e) => {
                      setHighlights(DOMPurify.sanitize(e.target.value));
                    }}
                  >
                    <option value="8e740c">Brown</option>
                    <option value="bc8a00">Blonde</option>
                    <option value="562a01">Dark Brown</option>
                  </select>
                </div>
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="feature" className={labelClass}>
                  Facial Feature
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="feature"
                    name="feature"
                    onChange={(e) => {
                      setFeature(DOMPurify.sanitize(e.target.value));
                    }}
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
              </div>

              <div className="col-span-full sm:col-span-6">
                <label htmlFor="background" className={labelClass}>
                  Background
                </label>
                <div>
                  <select
                    className={selectClass}
                    id="background"
                    name="background"
                    onChange={(e) => {
                      setBackground(DOMPurify.sanitize(e.target.value));
                    }}
                  >
                    <option value="LightGray">LightGray</option>
                    <option value="White">White</option>
                    <option value="none">Transparent</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
