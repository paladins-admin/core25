from pathlib import Path

js = r'''const menu=document.querySelector(".menu");
const links=document.querySelector(".nav-links");

if(menu&&links){
menu.addEventListener("click",()=>{
const open=links.classList.toggle("open");
menu.setAttribute("aria-expanded",String(open));
});
links.querySelectorAll("a").forEach(a=>{
a.addEventListener("click",()=>{
links.classList.remove("open");
menu.setAttribute("aria-expanded","false");
});
});
}

const observer=new IntersectionObserver(entries=>{
entries.forEach(entry=>{
if(entry.isIntersecting){
entry.target.classList.add("visible");
observer.unobserve(entry.target);
}
});
},{threshold:.12});

document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

document.querySelectorAll("[data-year]").forEach(el=>{
el.textContent=new Date().getFullYear();
});

document.querySelectorAll(".glow-card").forEach(card=>{

card.addEventListener("mousemove",e=>{
const rect=card.getBoundingClientRect();

const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

card.style.setProperty("--mx",x+"px");
card.style.setProperty("--my",y+"px");

const rotateY=((x-rect.width/2)/(rect.width/2))*5;
const rotateX=-((y-rect.height/2)/(rect.height/2))*5;

card.style.setProperty("--ry",rotateY+"deg");
card.style.setProperty("--rx",rotateX+"deg");
});

card.addEventListener("mouseleave",()=>{
card.style.setProperty("--ry","0deg");
card.style.setProperty("--rx","0deg");
});
});

document.addEventListener("pointermove",e=>{
document.documentElement.style.setProperty("--page-x",e.clientX+"px");
document.documentElement.style.setProperty("--page-y",e.clientY+"px");
});

if(typeof emailjs!=="undefined"){
emailjs.init({
publicKey:"FtAPiE63Z8v5bf0gR"
});
}

const form=document.querySelector("#contactForm");

if(form){

const messageElement=document.querySelector("#contactStatus");
const submitButton=document.querySelector("#contactSubmit");
const originalButtonText=submitButton?submitButton.textContent:"Send enquiry";

form.addEventListener("submit",async event=>{

event.preventDefault();

if(typeof emailjs==="undefined"){
showMessage("The email service could not be loaded. Please email hello@core25.com.au directly.","error");
return;
}

const name=document.querySelector("#name")?.value.trim()||"";
const email=document.querySelector("#email")?.value.trim()||"";
const organisation=document.querySelector("#organisation")?.value.trim()||"";
const interest=document.querySelector("#interest")?.value.trim()||"";
const enquiryMessage=document.querySelector("#message")?.value.trim()||"";
const website=document.querySelector("#website")?.value.trim()||"";

if(website){
form.reset();
showMessage("Thanks. Your enquiry has been sent.","success");
return;
}

if(!name||!email||!interest||!enquiryMessage){
showMessage("Please complete all required fields.","error");
return;
}

if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
showMessage("Please enter a valid email address.","error");
return;
}

setSubmitting(true);
showMessage("Sending your enquiry...","loading");

try{

await emailjs.send(
"service_p5kj2sh",
"template_adfue9m",
{
name,
email,
organisation:organisation||"Not provided",
interest,
message:enquiryMessage,
from_name:name,
from_email:email,
reply_to:email,
company:"Core25",
website_name:"core25.com.au"
}
);

form.reset();
showMessage("Thanks. Your enquiry has been sent successfully.","success");

}catch(err){

console.error(err);
showMessage("We could not send your enquiry. Please try again or email hello@core25.com.au.","error");

}finally{
setSubmitting(false);
}

});

function setSubmitting(state){
if(!submitButton)return;
submitButton.disabled=state;
submitButton.textContent=state?"Sending...":originalButtonText;
}

function showMessage(msg,status){
if(!messageElement)return;
messageElement.textContent=msg;
messageElement.dataset.status=status;
}

}
'''
path="/mnt/data/app.js"
Path(path).write_text(js,encoding="utf-8")
print(path)
