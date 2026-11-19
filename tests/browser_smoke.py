"""Exercise the shipped application against its built distribution in Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with ThreadingHTTPServer(("127.0.0.1",0), partial(SimpleHTTPRequestHandler,directory=root / "dist")) as server:
    Thread(target=server.serve_forever,daemon=True).start()
    base = f"http://127.0.0.1:{server.server_port}"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH"))
        page = browser.new_page(viewport={"width":390,"height":844})
        errors = []
        page.on('pageerror',lambda error: errors.append(str(error)))
        # Replay a verified catalogue record to exercise UI independently of the archive's availability.
        def fixture(route):
            route.fulfill(json={'response':{'numFound':1,'docs':[{'identifier':'encarta95','title':"Microsoft Encarta '95 (1995 MPEG Edition)",'mediatype':'software','creator':'Microsoft'}]}})
        page.route('https://archive.org/advancedsearch.php*',fixture)
        page.goto(base + '/')
        page.get_by_role('button',name='Encarta software · 1995').click()
        page.get_by_text("Microsoft Encarta '95 (1995 MPEG Edition)").wait_for()
        assert 'title%3A%22Encarta%22' in page.locator('#archive-search').get_attribute('href')
        assert page.locator('#from').input_value() == '1995'
        page.fill('#exclude','demo')
        page.get_by_role('button',name='Search archive').click()
        assert 'exclude=demo' in page.url
        page.reload()
        assert page.locator('#exclude').input_value() == 'demo'
        page.get_by_role('button',name='Clear search').click()
        assert page.locator('#results article').count() == 0
        assert not errors, errors
        assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
        browser.close()
    server.shutdown()
