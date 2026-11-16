# Kemendagri region dataset

`regions.csv.gz` holds every Indonesian administrative region with its official code, loaded into the
`regions` table by `bun run db:regions:import` (also run by `db:seed`). The application always reads the
database, never this file.

| Level               | Rows   |
| ------------------- | ------ |
| Province            | 38     |
| Regency / city      | 514    |
| District            | 7,285  |
| Village / kelurahan | 83,762 |
| Total               | 91,599 |

91,439 rows have a centre point. Village codes whose fourth segment starts with `1` are kelurahan,
`2` are desa.

## Source

| What                                                 | Upstream                                                                                              | Pinned commit |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------- |
| Codes and names                                      | [cahyadsn/wilayah](https://github.com/cahyadsn/wilayah) `db/wilayah.sql`                              | `d68e8d5516`  |
| Centre points (lat/lng only, boundary paths dropped) | [cahyadsn/wilayah_boundaries](https://github.com/cahyadsn/wilayah_boundaries) `db/{prov,kab,kec,kel}` | `2c0d8c791a`  |

Both follow the Kepmendagri 2025 region codes. The upstream file header cites Kepmendagri No.
300.2.2-2138 Tahun 2025 and its README cites No. 300.2.2-2430 Tahun 2025; the counts above match the
2025 official recapitulation. Version string in code: `REGION_DATASET_VERSION` in
`packages/db/src/regions/dataset.ts`.

## Licence

The region codes and names come from a government decision, which is not protected by copyright in
Indonesia (UU No. 28 Tahun 2014, Pasal 42). The packaged datasets are MIT licensed, Copyright (c) Cahya
DSN; their licence texts are kept next to this file (`LICENSE-cahyadsn-*.txt`) and must stay with the data.

## Updating to a newer version

1. Download `db/wilayah.sql` from cahyadsn/wilayah and clone cahyadsn/wilayah_boundaries at the new commits.
2. `bun run --cwd packages/db regions:build <path/to/wilayah.sql> <path/to/wilayah_boundaries/db>`
3. Update `REGION_DATASET_VERSION`, the commits and counts in this file, and the CHANGELOG.
4. `bun run db:regions:import` on each database. Codes missing from the new version are marked retired, never
   deleted, so villages and businesses that point at them keep working.
