"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function SimpleComponent(props: { text: string }) {
  const { text = props.text } = props;

  return (
    <section>
      <div className="container">
        <h3 className={`font-weight-normal mb-2`} style={{ color: "#001489" }}>
          {text}
        </h3>
        <ToastContainer />
      </div>
    </section>
  );
}
