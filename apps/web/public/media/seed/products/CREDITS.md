# Sample product photos

Stock photos from Wikimedia Commons, resized to 800 px and recompressed to WebP. They stand in for real product
photos until villages upload their own. Each `*.webp.json` next to a file lists the Commons page, author and licence
(CC0, public domain, CC BY or CC BY-SA). Replace them through the dashboard once real photos exist; the sample rows
are removed with `bun run db:seed:reset`.

Attribution is kept in the sidecar files; if the site ever shows these photos publicly, add a credits page that
lists author and licence per photo before launch.
