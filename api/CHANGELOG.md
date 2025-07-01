# @wbce-d9/api

## 11.0.5

### Patch Changes

- 645ef51: Bump dependencies to fix security alerts
- Updated dependencies [645ef51]
  - @wbce-d9/specs@9.26.5
  - @wbce-d9/storage-driver-cloudinary@9.27.1

## 11.0.4

### Patch Changes

- 3786de8: fix url to be bypassed by catch

## 11.0.3

### Patch Changes

- c71b9d5: Bump samlify from 2.8.10 to 2.10.0

## 11.0.2

### Patch Changes

- 4b4b098: Fix: Run Script Operation Not Executing in Directus Flows

## 11.0.1

### Patch Changes

- da7afa2: Bump xml-crypto

## 11.0.0

### Major Changes

- 03314e1: Switched from 'vm2 'to 'isolated-vm' to sandbox the "Run Script" functionality in Flows

  ## Breaking change

  ### Removed Support for Custom NPM Modules in the "Run Script" Operation in Flows

  Previously, Directus used vm2 to execute code in Run Script operations within Flows. However, vm2 is now unmaintained
  and has critical security vulnerabilities that could allow sandbox escapes, potentially compromising the host machine.
  To ensure a secure execution environment, we have migrated to isolated-vm.

  If your script requires a third-party library, you will need to create a custom operation extension.

### Patch Changes

- Updated dependencies [03314e1]
  - @wbce-d9/app@9.33.0

## 10.6.0

### Minor Changes

- 40644e2: npm security updates

### Patch Changes

- Updated dependencies [40644e2]
  - @wbce-d9/update-check@9.28.0
  - @wbce-d9/app@9.32.0
  - @wbce-d9/extensions-sdk@9.27.1
  - @wbce-d9/exceptions@9.26.4
  - @wbce-d9/utils@9.29.1

## 10.5.0

### Minor Changes

- af89302: npm security updates

### Patch Changes

- Updated dependencies [af89302]
  - @wbce-d9/storage-driver-cloudinary@9.27.0
  - @wbce-d9/extensions-sdk@9.27.0
  - @wbce-d9/update-check@9.27.0
  - @wbce-d9/constants@9.28.0
  - @wbce-d9/app@9.31.0
  - @wbce-d9/utils@9.29.1
  - @wbce-d9/storage-driver-azure@9.26.8
  - @wbce-d9/storage-driver-gcs@9.26.8
  - @wbce-d9/storage-driver-local@9.26.8
  - @wbce-d9/storage-driver-s3@9.26.10

## 10.4.0

### Minor Changes

- 91ab5d6: fix security vulnerabilies and authentification issues

### Patch Changes

- Updated dependencies [91ab5d6]
  - @wbce-d9/app@9.30.0
  - @wbce-d9/constants@9.27.0
  - @wbce-d9/utils@9.29.0
  - @wbce-d9/extensions-sdk@9.26.7
  - @wbce-d9/exceptions@9.26.4
  - @wbce-d9/storage-driver-azure@9.26.7
  - @wbce-d9/storage-driver-cloudinary@9.26.7
  - @wbce-d9/storage-driver-gcs@9.26.7
  - @wbce-d9/storage-driver-local@9.26.7
  - @wbce-d9/storage-driver-s3@9.26.9

## 10.3.1

### Patch Changes

- b59e970: npm security updates
- Updated dependencies [b59e970]
  - @wbce-d9/app@9.29.1
  - @wbce-d9/constants@9.26.4
  - @wbce-d9/exceptions@9.26.4
  - @wbce-d9/extensions-sdk@9.26.6
  - @wbce-d9/schema@9.26.4
  - @wbce-d9/specs@9.26.4
  - @wbce-d9/storage@9.26.4
  - @wbce-d9/storage-driver-azure@9.26.6
  - @wbce-d9/storage-driver-cloudinary@9.26.6
  - @wbce-d9/storage-driver-gcs@9.26.6
  - @wbce-d9/storage-driver-local@9.26.6
  - @wbce-d9/storage-driver-s3@9.26.8
  - @wbce-d9/update-check@9.26.4
  - @wbce-d9/utils@9.28.1

## 10.3.0

### Minor Changes

- fcf6cf4: Empty realease to update d9 version

## 10.2.0

### Minor Changes

- bce4637: Make patitionned optional

## 10.1.0

### Minor Changes

- 4d186ff: This pull request introduces the "Partitioned" tag for the sessions cookie to prevent it from being treated
  as a third-party cookie by browsers. Additionally, it adds an environment variable REFRESH_TOKEN_COOKIE_PARTITIONED
  which can be set to false to deactivate this feature.

## 10.0.0

### Major Changes

- 65185c3: Refactored and fixed Oauth and OpendId flows

### Minor Changes

- 65185c3: Revoke tokens on sessions logout for OpenId SSO

## 9.29.0

### Minor Changes

- 41a3210: Revoke tokens on sessions logout for OpenId SSO

## 9.28.0

### Minor Changes

- 7255037: Fix openid connector for keycloack
- 6d7f40e: fix cache compression

### Patch Changes

- Updated dependencies [9d909a7]
  - @wbce-d9/app@9.29.0

## 9.27.0

### Minor Changes

- 7c1b7c7: Fix M2M panel visualization for collections

### Patch Changes

- Updated dependencies [7c1b7c7]
  - @wbce-d9/utils@9.28.0
  - @wbce-d9/app@9.28.0
  - @wbce-d9/extensions-sdk@9.26.5
  - @wbce-d9/storage-driver-azure@9.26.5
  - @wbce-d9/storage-driver-cloudinary@9.26.5
  - @wbce-d9/storage-driver-gcs@9.26.5
  - @wbce-d9/storage-driver-local@9.26.5
  - @wbce-d9/storage-driver-s3@9.26.7

## 9.26.7

### Patch Changes

- Updated dependencies
  - @wbce-d9/app@9.27.0

## 9.26.6

### Patch Changes

- 5998365: update aws-sdk
- Updated dependencies [5998365]
  - @wbce-d9/storage-driver-s3@9.26.6

## 9.26.5

### Patch Changes

- b2b739e: update aws-sdk
- Updated dependencies [b2b739e]
  - @wbce-d9/storage-driver-s3@9.26.5

## 9.26.4

### Patch Changes

- Updated dependencies [9740cc5]
  - @wbce-d9/utils@9.27.0
  - @wbce-d9/app@9.26.4
  - @wbce-d9/extensions-sdk@9.26.4
  - @wbce-d9/storage-driver-azure@9.26.4
  - @wbce-d9/storage-driver-cloudinary@9.26.4
  - @wbce-d9/storage-driver-gcs@9.26.4
  - @wbce-d9/storage-driver-local@9.26.4
  - @wbce-d9/storage-driver-s3@9.26.4

## 9.26.3

### Patch Changes

- f1b4684: change package organization
- Updated dependencies [f1b4684]
  - @wbce-d9/storage-driver-cloudinary@9.26.3
  - @wbce-d9/storage-driver-azure@9.26.3
  - @wbce-d9/storage-driver-local@9.26.3
  - @wbce-d9/storage-driver-gcs@9.26.3
  - @wbce-d9/storage-driver-s3@9.26.3
  - @wbce-d9/extensions-sdk@9.26.3
  - @wbce-d9/update-check@9.26.3
  - @wbce-d9/exceptions@9.26.3
  - @wbce-d9/constants@9.26.3
  - @wbce-d9/storage@9.26.3
  - @wbce-d9/schema@9.26.3
  - @wbce-d9/specs@9.26.3
  - @wbce-d9/utils@9.26.3
  - @wbce-d9/app@9.26.3

## 9.26.2

### Patch Changes

- 973f4bb: update packages
- Updated dependencies [973f4bb]
  - @wbce-d9/app@9.26.2
  - @wbce-d9/constants@9.26.2
  - @wbce-d9/exceptions@9.26.2
  - @wbce-d9/extensions-sdk@9.26.2
  - @wbce-d9/schema@9.26.2
  - @wbce-d9/specs@9.26.2
  - @wbce-d9/storage@9.26.2
  - @wbce-d9/storage-driver-azure@9.26.2
  - @wbce-d9/storage-driver-cloudinary@9.26.2
  - @wbce-d9/storage-driver-gcs@9.26.2
  - @wbce-d9/storage-driver-local@9.26.2
  - @wbce-d9/storage-driver-s3@9.26.2
  - @wbce-d9/update-check@9.26.2
  - @wbce-d9/utils@9.26.2

## 9.26.1

### Patch Changes

- 9e4a63a: @directus9
- Updated dependencies [9e4a63a]
  - @wbce-d9/storage-driver-cloudinary@9.26.1
  - @wbce-d9/storage-driver-azure@9.26.1
  - @wbce-d9/storage-driver-local@9.26.1
  - @wbce-d9/storage-driver-gcs@9.26.1
  - @wbce-d9/storage-driver-s3@9.26.1
  - @wbce-d9/extensions-sdk@9.26.1
  - @wbce-d9/update-check@9.26.1
  - @wbce-d9/exceptions@9.26.1
  - @wbce-d9/constants@9.26.1
  - @wbce-d9/storage@9.26.1
  - @wbce-d9/schema@9.26.1
  - @wbce-d9/specs@9.26.1
  - @wbce-d9/utils@9.26.1
  - @wbce-d9/app@9.26.1
