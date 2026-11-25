# Media Echoes

Search forgotten software, Flash projects, CDs, games, videos and images in the Internet Archive. View original catalogue information, previews, and file names, then open the source item to see what can be viewed or downloaded.

Search defaults to titles. Choose all catalogue fields, creator, subject or archive identifier, then match all words or a phrase. Combine filters for a creator phrase, collection identifier, excluded words or phrases, and a custom year interval. Custom years override a date preset. All criteria are sent to Internet Archive before pagination. The browser address and the official search link preserve the criteria.

<!-- coolcode:guide -->
Use Encarta software · 1995 to narrow the search to software records with Encarta in the title and a catalogue date in 1995. The source search included Microsoft Encarta ’95 (1995 MPEG Edition), identifier encarta95. Inspect its files or refine the search by creator. The Myst software · 1993 and Homestar Runner · Flash shortcuts also combine title and collection or year filters.
Public Reels presents a dated, curated Prelinger selection: Cold War PSAs, industrial films, educational shorts and historical travel. Filter the collection, play or shuffle a film, and save a local playlist with JSON import/export. Only films with an explicit public-domain designation in Archive metadata enter this shelf; the source designation does not guarantee rights in every jurisdiction. Playback loads Internet Archive only after you choose a film. The wider software/media search remains available below.
<!-- /coolcode:guide -->
 Canada-related searches match catalogue text and can include material about Canada or from Canadian institutions; they do not establish production origin. Catalogue dates can differ from original release dates and are optional.

## Build

Run `python3 scripts/build.py` and serve the resulting `dist/` directory over HTTP. For example, run `python3 -m http.server --directory dist 8000`. Assets are relative for GitHub Pages project subdirectories.

Search, image previews, and details are retrieved live by the visitor's browser from Internet Archive's public services. The wider search bundles no copied media; Public Reels includes a small dated metadata selection, with playback on Internet Archive. Searches are limited to 50 pages per query and file details to the first 12 matching names. Use the source page to access the full available catalogue and verify rights. Search terms are sent to Internet Archive; no account or API key is needed.

## Sources

- [Internet Archive developer search documentation](https://archive.org/developers/search.html)
- [Public advanced search](https://archive.org/advancedsearch.php)
- [Internet Archive metadata API](https://archive.org/developers/md-read.html)

## Public Reels configuration and refresh

Edit `web/reels-config.json` to add editorial collections or change bounded Prelinger queries. `perCollection` is capped at12. Run `python3 scripts/refresh_reels.py` to capture matching metadata. Only explicit Creative Commons public-domain designations pass the collector; it does not infer rights from collection membership or age. This is a source rights label, not a worldwide legal conclusion. Review each resulting film and the source designation before publishing. All collections must have useful actual coverage.

The collector stores metadata in `web/data/reels.json` with a capture date; no media is downloaded, no new schedule or API key is needed. A failed or too-small collection leaves prior data intact. `Play film` and `Shuffle a film` load the Archive iframe only after a click. Shuffle avoids the current film when another match exists. Search/filtering is local for Public Reels. Playlist IDs persist under `coolcode:mediaechoes:reels-playlist`; export/import JSON preserves them across devices. Imported unknown IDs remain in the list but cannot create arbitrary embeds. No playlist is uploaded.

Run `node --test tests/*.test.mjs`, `python3 -m unittest discover -s tests -v` and `python3 scripts/build.py`; commit reviewed files to main. Pages CI also checks playlist persistence, playback opt-in and narrow-screen layout.
