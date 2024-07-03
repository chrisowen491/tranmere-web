"use client";
import { useState } from "react";

export function ContactForm() {
  const [failClass, setFailClass] = useState("none");
  const [successClass, setSuccessClass] = useState("none");
  const [formClass, setFormClass] = useState("");

  const onSubmit = async (formData: FormData) => {
        var data = {
            name: formData.get("name"),
            email: formData.get("email"),
            desc: formData.get("message")
        };

        const contactRequest = await fetch('/api/contact-us', {
            method: "post",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if(contactRequest.status == 200) {
            setSuccessClass("")
            setFormClass("none")
        } else {
            setFailClass("")
        }
  };

  return (
    <>
        <div className="alert alert-warning alert-dismissible fade show" role="alert" style={{display:`${failClass}`}} id="fail-alert" >
            <i className="icon-check2"></i>
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
            <h4 className="fs-22">Oops - Something has gone wrong</h4>
            <p>Please try again later</p>
        </div>
        <div className="alert alert-success alert-dismissible fade show" role="alert" style={{display:`${successClass}`}} id="success-alert" >
            <i className="icon-check2"></i>
            <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">×</span>
            </button>
            <h4 className="fs-22">Thanks</h4>
            <p>We will get in touch shortly</p>
        </div>
        <div className="row" id="contact-form"  style={{display:`${formClass}`}}>
            <form action={onSubmit}>
                <div className="col">
                    <div className="row gutter-1 gutter-md-2">
                        <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input id="name" className="form-control" type="text" placeholder="Name" name="name" />
                        </div>
                        </div>
                        <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input id="email" className="form-control" type="text" placeholder="Email" name="email" />
                        </div>
                        </div>
                        <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea className="form-control" name="message" id="message" cols={30} rows={5} placeholder="Type your message here ..."></textarea>
                        </div>
                        </div>
                        <div className="col-md-12 mt-1">
                            <button type="submit" className="btn btn-primary px-3 contact-us-button">Send Message</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </>
  );
}
