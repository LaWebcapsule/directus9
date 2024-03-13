---
'@wbce-d9/api': minor
---

This pull request introduces the "Partitioned" tag for the sessions cookie to prevent it from being treated as a
third-party cookie by browsers. Additionally, it adds an environment variable REFRESH_TOKEN_COOKIE_PARTITIONED which can
be set to false to deactivate this feature.
