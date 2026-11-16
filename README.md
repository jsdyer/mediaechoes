# Media Echoes

Search forgotten software, Flash projects, CDs, games, videos and images in the Internet Archive. View original catalogue information, previews, and file names, then open the source item to see what can be viewed or downloaded.

Use a title, creator, subject, or a phrase in quotes. Select a media collection and catalogue date range. Canada-related searches match catalogue text and can include material about Canada or from Canadian institutions; they do not establish production origin. Catalogue dates can differ from original release dates and are optional.

## Build

Run `python3 scripts/build.py` and serve the resulting `dist/` directory over HTTP. For example, run `python3 -m http.server --directory dist 8000`. Assets are relative for GitHub Pages project subdirectories.

Search, image previews, and details are retrieved live by the visitor's browser from Internet Archive's public services. This app bundles no copied media or independent catalogue. Searches are limited to 50 pages per query and file details to the first 12 matching names. Use the source page to access the full available catalogue and verify rights. Search terms are sent to Internet Archive; no account or API key is needed.

## Sources

- [Internet Archive developer search documentation](https://archive.org/developers/search.html)
- [Public advanced search](https://archive.org/advancedsearch.php)
- [Internet Archive metadata API](https://archive.org/developers/md-read.html)
