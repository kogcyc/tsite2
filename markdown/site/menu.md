---
title: m e n u
desc:  
image:
template: template_menu.html
exclude:
  - search
  - all_pages
---
###About Us###
Kogswell Cycles is a convergence of ideas about bicycle use.
Our aim is to create a place where people who care about making bicycles safer, more comfortable, more durable, and more affordable can share ideas and learn from one another.
Anyone serious about that goal is welcome here.

###Contact Us###

- **TELEPHONE / TEXT**
    - call or text us during regular California business hours<br> <span style="font-size:0.9rem;color:#555;"> 
    - (Current time: <span id="ca-clock" style="font-weight:700;color:#a00;">--:--</span>) 
    - 
</span> </p> <p style="display:flex;align-items:center;gap:1rem;"> <span style="font-size:1.1rem;font-weight:600;"> +1&nbsp;341&nbsp;333&nbsp;8900 </span> 
    - <img src="/static/telephone_qr.svg" alt="Dial QR Code" style="height:80px;" />

- **EMAIL**
    - email us
    - <a href="mailto:m@kogswellcycles.com" style="font-weight:600;"> m@kogswellcycles.com </a> 
    - <img src="/static/mail_qr.svg" alt="Email QR Code" style="height:80px;" />

<script>
(function () {
  const el = document.getElementById("ca-clock");

  function updateClock() {
    const now = new Date();
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(now);

    el.textContent = time.toLowerCase(); // makes AM/PM -> am/pm
  }

  updateClock();
  setInterval(updateClock, 1000);
})();
</script>