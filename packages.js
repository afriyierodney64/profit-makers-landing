/* Public read of active categories.
   Same project the Profit Makers app bakes in from
   VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. */
(function () {
  var SUPABASE_URL = "https://vmtluuuhafknkuhuybgx.supabase.co";
  var SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtdGx1dXVoYWZrbmt1aHV5Ymd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Nzg3MzMsImV4cCI6MjEwOTA1NDczM30.GEyeKwUnEqBwjXwOc9SAyEkvw8Qson0B2HRtXsrWaA4";
  var SIGNUP = "https://profit-makers.pages.dev/signup";
  var APP = "https://profit-makers.pages.dev/";
  var list = document.getElementById("package-list");
  if (!list) return;

  var money = new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 2
  });

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function priceLabel(pesewas) {
    var amount = Number(pesewas) / 100;
    if (!Number.isFinite(amount)) return "";
    if (amount === 0) return "Free";
    return money.format(amount) + " per access";
  }

  function fallback(title, body, href, label) {
    list.replaceChildren();
    var card = el("article", "card");
    card.appendChild(el("h3", null, title));
    card.appendChild(el("p", "muted", body));
    var link = el("a", "btn btn-emerald btn-block", label);
    link.href = href;
    card.appendChild(link);
    list.appendChild(card);
  }

  function cardFor(row) {
    var card = el("article", "card");
    var head = el("div");
    head.appendChild(el("h3", null, row.name || "Package"));
    if (row.price_pesewas != null) {
      var label = priceLabel(row.price_pesewas);
      if (label) head.appendChild(el("p", "price", label));
    }
    card.appendChild(head);
    if (row.tagline) card.appendChild(el("p", "tagline", row.tagline));
    var hoursText = row.access_hours != null && row.access_hours !== ""
      ? "Valid for " + row.access_hours + " hours"
      : "";
    var bullets = Array.isArray(row.bullets) ? row.bullets.slice(0, 3) : [];
    if (hoursText) {
      bullets = bullets.filter(function (item) {
        return String(item).trim().toLowerCase() !== hoursText.toLowerCase();
      });
    }
    if (bullets.length) {
      var ul = el("ul");
      bullets.forEach(function (item) {
        if (item) ul.appendChild(el("li", null, String(item)));
      });
      if (ul.childNodes.length) card.appendChild(ul);
    }
    if (hoursText) card.appendChild(el("p", "hours", hoursText));
    var link = el("a", "btn btn-emerald btn-block", "Get started");
    link.href = SIGNUP;
    card.appendChild(link);
    return card;
  }

  var url = SUPABASE_URL + "/rest/v1/categories?select=name,tagline,bullets,price_pesewas,access_hours,sort&is_active=eq.true&order=sort.asc";

  fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: "Bearer " + SUPABASE_ANON_KEY,
      Accept: "application/json"
    }
  })
    .then(function (res) {
      if (!res.ok) throw new Error("packages");
      return res.json();
    })
    .then(function (rows) {
      if (!Array.isArray(rows) || rows.length === 0) {
        fallback("No packages yet", "Open the app to see what is available.", APP, "Open the app");
        return;
      }
      var frag = document.createDocumentFragment();
      rows.forEach(function (row) { frag.appendChild(cardFor(row)); });
      list.replaceChildren(frag);
    })
    .catch(function () {
      fallback("Packages", "See what is open in the app.", APP, "Open the app");
    });
})();
