# Media Echoes

Search forgotten software, Flash projects, CDs, games, videos and images in the Internet Archive. View original catalogue information, previews, and file names, then open the source item to see what can be viewed or downloaded.

Search defaults to titles. Choose all catalogue fields, creator, subject or archive identifier, then match all words or a phrase. Combine filters for a creator phrase, collection identifier, excluded words or phrases, and a custom year interval. Custom years override a date preset. All criteria are sent to Internet Archive before pagination. The browser address and the official search link preserve the criteria.

<!-- coolcode:guide -->
Use Encarta software · 1995 to narrow the search to software records with Encarta in the title and a catalogue date in 1995. The source search included Microsoft Encarta ’95 (1995 MPEG Edition), identifier encarta95. Inspect its files or refine the search by creator. The Myst software · 1993 and Homestar Runner · Flash shortcuts also combine title and collection or year filters.
<!-- /coolcode:guide -->
 Canada-related searches match catalogue text and can include material about Canada or from Canadian institutions; they do not establish production origin. Catalogue dates can differ from original release dates and are optional.

## Build

Run `python3 scripts/build.py` and serve the resulting `dist/` directory over HTTP. For example, run `python3 -m http.server --directory dist 8000`. Assets are relative for GitHub Pages project subdirectories.

Search, image previews, and details are retrieved live by the visitor's browser from Internet Archive's public services. This app bundles no copied media or independent catalogue. Searches are limited to 50 pages per query and file details to the first 12 matching names. Use the source page to access the full available catalogue and verify rights. Search terms are sent to Internet Archive; no account or API key is needed.

## Sources

- [Internet Archive developer search documentation](https://archive.org/developers/search.html)
- [Public advanced search](https://archive.org/advancedsearch.php)
- [Internet Archive metadata API](https://archive.org/developers/md-read.html)
