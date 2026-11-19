export const archive = "https://archive.org";
export const perPage = 18;
export const maxPages = 50;

export const scopes = {
  all: "(mediatype:software OR mediatype:movies OR mediatype:image)",
  software: "mediatype:software",
  flash: "collection:softwarelibrary_flash",
  cdrom: "collection:cdromsoftware",
  movies: "mediatype:movies",
  images: "mediatype:image",
};

export const periods = {
  all: "",
  through1989: "[* TO 1989-12-31T23:59:59Z]",
  "1990s": "[1990-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]",
  "2000s": "[2000-01-01T00:00:00Z TO 2009-12-31T23:59:59Z]",
  "2010s": "[2010-01-01T00:00:00Z TO 2019-12-31T23:59:59Z]",
  since2020: "[2020-01-01T00:00:00Z TO *]",
};

export const sorts = {
  relevance: "",
  views: "downloads desc",
  oldest: "date asc",
  newest: "date desc",
};

const fields = ["identifier", "title", "creator", "date", "year", "publicdate", "mediatype", "collection", "description", "subject", "licenseurl", "downloads"];
export const validIdentifier = value => typeof value === "string" && /^[a-z\d][a-z\d._-]{0,140}$/i.test(value);
export const itemUrl = id => archive + "/details/" + encodeURIComponent(id);
export const thumbUrl = id => archive + "/services/img/" + encodeURIComponent(id);
export const metadataUrl = id => archive + "/metadata/" + encodeURIComponent(id);
export const filesUrl = id => archive + "/download/" + encodeURIComponent(id) + "/";

export const searchFields = {all:'', title:'title:', creator:'creator:', subject:'subject:', identifier:'identifier:'};
const quote = text => '"' + text.replace(/[\u0000-\u001f]/g,' ').replace(/([\\"])/g,'\\$1') + '"';
const words = text => [...text.slice(0,180).matchAll(/"([^"]+)"|([^\s"]+)/g)].slice(0,12).map(match => match[1] || match[2]);

export function queryFor({query='',scope='all',era='all',field='all',phrase='',creator='',collection='',exclude='',from='',to=''}) {
  const clauses = [Object.hasOwn(scopes, scope) ? scopes[scope] : scopes.all];
  if (from || to) {
    if ([from,to].some(y => y && !/^[1-9]\d{3}$/.test(y)) || (from && to && from > to)) {
      throw Error('Use four-digit years and put the earlier year first.');
    }
    clauses.push('date:[' + (from ? from + '-01-01T00:00:00Z' : '*') + ' TO ' + (to ? to + '-12-31T23:59:59Z' : '*') + ']');
  } else if (Object.hasOwn(periods, era) && periods[era]) clauses.push('date:' + periods[era]);
  const prefix = Object.hasOwn(searchFields,field) ? searchFields[field] : '';
  const terms = phrase === 'phrase' ? [query.trim().slice(0,180)].filter(Boolean) : words(query);
  for (const value of terms) clauses.push(prefix + quote(value));
  if (creator.trim()) clauses.push('creator:' + quote(creator.trim().slice(0,180)));
  if (collection.trim()) clauses.push('collection:' + quote(collection.trim().slice(0,140)));
  for (const term of words(exclude)) clauses.push('NOT ' + quote(term));
  return clauses.join(' AND ');
}

export function searchUrls(filters, page) {
  const q = queryFor(filters);
  const request = new URL(archive + "/advancedsearch.php");
  const official = new URL(archive + "/search");
  official.searchParams.set("query", q);
  request.searchParams.set("q", q);
  request.searchParams.set("output", "json");
  request.searchParams.set("rows", String(perPage));
  request.searchParams.set("page", String(Math.max(1, Math.min(maxPages, Math.trunc(page) || 1))));
  const sort = Object.hasOwn(sorts, filters.sort) ? sorts[filters.sort] : "";
  if (sort) request.searchParams.append("sort[]", sort);
  for (const field of fields) request.searchParams.append("fl[]", field);
  return { request, official };
}

export function strings(value) {
  const values = Array.isArray(value) ? value : typeof value === "string" || typeof value === "number" ? [value] : [];
  return values.map(item => typeof item === "string" || typeof item === "number" ? String(item).trim() : "").filter(Boolean);
}

export function catalogueDate(record) {
  return strings(record.date)[0]?.replace(/T\d{2}:\d{2}:\d{2}.*$/, "") || strings(record.year)[0] || "";
}

export function excerpt(value) {
  const plain = strings(value).join(" ").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const words = plain.split(" ");
  let snippet = words.slice(0, 22).join(" ").slice(0, 240);
  if (snippet.length < plain.length) snippet += "…";
  return snippet;
}

export function safeLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : "";
  } catch {
    return "";
  }
}

export function fileEntries(source) {
  if (!Array.isArray(source)) return [];
  return source.filter(item => item && typeof item.name === "string" && item.name.length < 400
    && !/(?:_files\.xml|_meta\.xml|_reviews\.xml|_archive\.torrent|__ia_thumb\.jpg)$/i.test(item.name)
    && /\.(?:swf|dcr|dir|iso|img|bin|cue|zip|7z|rar|exe|msi|dmg|sit|hqx|mp4|mkv|mov|avi|webm|m4v|mpg|mpeg|pdf|jpg|jpeg|gif|png|ogg|mp3|wav)$/i.test(item.name)
  );
}
