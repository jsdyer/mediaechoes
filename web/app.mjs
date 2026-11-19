import { catalogueDate, excerpt, fileEntries, filesUrl, itemUrl, maxPages, metadataUrl, perPage, periods, safeLink, scopes, searchFields, searchUrls, sorts, strings, thumbUrl, validIdentifier } from "./model.mjs";

const get = id => document.getElementById(id);
const form = get("search-form");
const status = get("status");
const results = get("results");
const dialog = get("details");
const detail = get("detail-body");
const formatCount = new Intl.NumberFormat("en-CA");
const controls = ["query", "scope", "era", "sort", "field", "phrase", "creator", "collection", "exclude", "from", "to"];
let request;
let detailRequest;
let activeFilters;
let page = 1;
let pages = 1;

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function link(label, url, className) {
  const node = element("a", label, className);
  node.href = url;
  node.target = "_blank";
  node.rel = "noopener noreferrer";
  return node;
}

function button(label, fn, className = "pill") {
  const node = element("button", label, className);
  node.type = "button";
  node.addEventListener("click", fn);
  return node;
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}

async function getJson(url, signal) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(18000)]),
    credentials: "omit",
  });
  if (!response.ok) {
    if (response.status === 429) throw new Error("The Archive is rate limiting searches. Try again shortly.");
    throw new Error("Internet Archive returned HTTP " + response.status + ".");
  }
  return response.json();
}

function errorText(error) {
  if (error.name === "TimeoutError") return "Internet Archive did not respond in time.";
  if (error instanceof TypeError) return "This browser could not reach Internet Archive search.";
  return error.message;
}

function filters() {
  return Object.fromEntries(controls.map(id => [id, get(id).value.trim()]));
}

function restore(hash) {
  const choices = { scope: scopes, era: periods, sort: sorts, field:searchFields, phrase:{words:true,phrase:true} };
  if (!hash.has("field") && hash.size) get("field").value = "all";
  for (const id of controls) {
    const value = hash.get(id);
    if (!value) continue;
    if (!choices[id]) get(id).value = value.slice(0, get(id).maxLength);
    else if (Object.hasOwn(choices[id], value)) get(id).value = value;
  }
}

function copySearchToAddress(f, p) {
  const hash = new URLSearchParams(Object.entries(f).filter(([,value]) => value));
  if (p !== 1) hash.set("page", String(p));
  history.replaceState(null, "", "#" + hash.toString());
}

const title = item => strings(item.title)[0] || item.identifier;
const media = item => ({ software: "Software", movies: "Video", image: "Image" }[item.mediatype] || "Archive item");

function card(item) {
  const outer = element("article", undefined, "card");
  const preview = element("div", undefined, "media-preview");
  const thumbnail = document.createElement("img");
  thumbnail.alt = "";
  thumbnail.loading = "lazy";
  thumbnail.referrerPolicy = "no-referrer";
  thumbnail.addEventListener("error", () => { preview.replaceChildren("Preview unavailable"); }, { once: true });
  thumbnail.src = thumbUrl(item.identifier);
  preview.append(thumbnail);
  const content = element("div", undefined, "card-content");
  const meta = element("div", undefined, "meta");
  meta.append(element("span", media(item), "badge"));
  const date = catalogueDate(item);
  if (date) meta.append(element("span", date, "badge"));
  content.append(meta, element("h3", title(item)));
  const creator = strings(item.creator).slice(0, 2).join(", ");
  if (creator) content.append(element("p", creator, "byline"));
  const summary = excerpt(item.description);
  if (summary) content.append(element("p", summary, "excerpt"));
  const actions = element("div", undefined, "actions");
  actions.append(button("Inspect item", () => showDetails(item)), link("Original archive item ↗", itemUrl(item.identifier)));
  content.append(actions);
  outer.append(preview, content);
  return outer;
}

async function search(f, requestedPage = 1) {
  let urls;
  try { urls = searchUrls(f, requestedPage); }
  catch (error) { setStatus(error.message, true); return; }
  if (!f.query && !f.creator && !f.collection && !f.from && !f.to && f.era === 'all' && f.scope === 'all' && !f.exclude) {
    setStatus('Enter a search term, choose a collection or add a year before searching.'); return;
  }
  request?.abort();
  const controller = new AbortController();
  request = controller;
  get("paging").hidden = true;
  results.replaceChildren();
  activeFilters = f;
  page = Math.min(maxPages, Math.max(1, Math.trunc(requestedPage) || 1));
  copySearchToAddress(f, page);

  get("archive-search").href = urls.official.href;
  get("result-actions").hidden = false;
  form.setAttribute("aria-busy", "true");
  setStatus("Searching the Internet Archive catalogue…");
  try {
    const response = await getJson(urls.request.href, controller.signal);
    if (request !== controller) return;
    const hits = response?.response;
    if (!Array.isArray(hits?.docs) || !Number.isFinite(hits.numFound)) {
      throw new Error("The Archive returned an unexpected search response.");
    }
    const items = hits.docs.filter(item => validIdentifier(item?.identifier));
    pages = Math.min(maxPages, Math.ceil(hits.numFound / perPage));
    if (!items.length) {
      results.replaceChildren(element("p", "No entries on this page. Try a shorter phrase, a broader collection, or a different date filter.", "empty"));
    } else {
      results.replaceChildren(...items.map(card));
    }
    setStatus(formatCount.format(hits.numFound) + " catalogue match" + (hits.numFound === 1 ? "" : "es") + ". Showing " + items.length + " on this page." + (hits.numFound > 250 ? " Narrow the title, add a creator, or limit the years above." : ""));
    get("previous").disabled = page === 1;
    get("next").disabled = page >= pages;
    get("page-label").textContent = "Page " + page + " of " + Math.max(1, pages)
      + (hits.numFound > perPage * maxPages ? " displayed · refine to see more" : "");
    get("paging").hidden = !(pages > 1 || page > 1);
  } catch (error) {
    if (request !== controller || controller.signal.aborted) return;
    setStatus(errorText(error) + " You can try again or open the same search on Internet Archive.", true);
  } finally {
    if (request === controller) form.removeAttribute("aria-busy");
  }
}

function addMeta(list, name, value) {
  if (!value) return;
  const data = element("dd");
  if (value instanceof Element) data.append(value);
  else data.textContent = value;
  list.append(element("dt", name), data);
}

async function showDetails(item) {
  detailRequest?.abort();
  const controller = new AbortController();
  detailRequest = controller;
  const heading = element("h2", title(item));
  heading.id = "detail-title";
  const actions = element("div", undefined, "actions");
  actions.append(link("Open on Internet Archive ↗", itemUrl(item.identifier), "secondary"), link("Archive file list ↗", filesUrl(item.identifier)));
  const fields = element("dl", undefined, "meta-grid");
  addMeta(fields, "Identifier", item.identifier);
  addMeta(fields, "Creator", strings(item.creator).join(", "));
  addMeta(fields, "Catalogue date", catalogueDate(item));
  addMeta(fields, "Uploaded", strings(item.publicdate)[0]?.slice(0, 10));
  addMeta(fields, "Subjects", strings(item.subject).slice(0, 15).join(", "));
  addMeta(fields, "Collection", strings(item.collection).slice(0, 10).join(", "));
  const license = safeLink(strings(item.licenseurl)[0] || "");
  addMeta(fields, "Rights", license ? link("Licence listed by the archive ↗", license) : "See the original item for access and rights information.");
  const listing = element("section");
  listing.append(element("h3", "Listed media and software files"), element("p", "Loading file names from the Archive…", "fine"));
  detail.replaceChildren(heading, actions, fields, listing);
  if (!dialog.open) dialog.showModal();
  try {
    const metadata = await getJson(metadataUrl(item.identifier), controller.signal);
    if (detailRequest !== controller || !dialog.open) return;
    const files = fileEntries(metadata.files);
    if (!files.length) {
      listing.replaceChildren(element("h3", "Listed media and software files"),
        element("p", "No matching file names were returned. The original item may have a viewer or other files.", "fine"));
      return;
    }
    const list = element("ul", undefined, "file-list");
    for (const file of files.slice(0, 12)) list.append(element("li", file.name));
    listing.replaceChildren(element("h3", "Listed media and software files"), list,
      element("p", formatCount.format(files.length) + " file entries in matching formats. Access is determined by the original item.", "fine"));
  } catch (error) {
    if (detailRequest === controller && !controller.signal.aborted) {
      listing.replaceChildren(element("h3", "Listed media and software files"),
        element("p", errorText(error) + " Use the archive file-list link above.", "fine"));
    }
  }
}

dialog.addEventListener("close", () => detailRequest?.abort());
form.addEventListener("submit", event => { event.preventDefault(); search(filters()); });
for (const preset of document.querySelectorAll("[data-scope]")) {
  preset.addEventListener("click", () => {
    form.reset();
    get("field").value = "title";
    get("phrase").value = "phrase";
    get("from").value = preset.dataset.from || "";
    get("to").value = preset.dataset.to || "";
    get("refine").open = Boolean(get("from").value);
    get("scope").value = preset.dataset.scope;
    get("query").value = preset.dataset.query || "";
    get("era").value = preset.dataset.era || "all";
    get("sort").value = "relevance";
    search(filters());
  });
}
get("previous").addEventListener("click", () => { if (page > 1) search(activeFilters, page - 1); });
get("next").addEventListener("click", () => { if (page < pages) search(activeFilters, page + 1); });
const initial = new URLSearchParams(location.hash.slice(1));
restore(initial);
get("refine").open = ["from","to","creator","collection","exclude"].some(id => get(id).value);
get("clear-filters").addEventListener("click", () => {
  request?.abort(); request = null; form.removeAttribute("aria-busy"); form.reset(); get("refine").open = false;
  results.replaceChildren(); get("paging").hidden = get("result-actions").hidden = true;
  history.replaceState(null,"",location.pathname + location.search);
  setStatus("Enter a search term or use a focused search."); get("query").focus();
});
if (initial.has("query") || initial.has("scope")) search(filters(), Number(initial.get("page")));
