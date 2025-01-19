PS D:\DaiHung\__labo\AIanalist-bun-express> bun install -g firebase-tools
bun add v1.1.42 (50eec002)
[9.33ms] migrated lockfile from package-lock.json

installed firebase-tools@13.29.1 with binaries:
 - firebase

561 packages installed [8.71s]

Blocked 1 postinstall. Run `bun pm -g untrusted` for details.
PS D:\DaiHung\__labo\AIanalist-bun-express> firebase login
>>
>>
i  Firebase optionally collects CLI and Emulator Suite usage and error reporting information to help improve our products. Data is collected in accordance with Google's privacy policy (https://policies.google.com/privacy) and is not used to identify you.

? Allow Firebase to collect CLI and Emulator Suite usage and error reporting information? Yes
i  To change your data collection preference at any time, run `firebase logout` and log in again.

Visit this URL on this device to log in:
https://accounts.google.com/o/oauth2/auth?client_id=...

Waiting for authentication...

+  Success! Logged in as daihung.pham@gmail.com
PS D:\DaiHung\__labo\AIanalist-bun-express> firebase init emulators
>>

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  D:\DaiHung\__labo\AIanalist-bun-express

? Are you ready to proceed? Yes

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: ai-analyst-14876 (AI-analyst)
i  Using project ai-analyst-14876 (AI-analyst)

=== Emulators Setup
? Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. Authentication Emulator, Firestore Emulator
? Which port do you want to use for the auth emulator? 9099
? Which port do you want to use for the firestore emulator? 8080
? Would you like to enable the Emulator UI? Yes
? Which port do you want to use for the Emulator UI (leave empty to use any available port)? 4000
? Would you like to download the emulators now? Yes
i  firestore: downloading cloud-firestore-emulator-v1.19.8.jar...
Progress: ========================================================================================================================================================================================================================================> (100% of 64MB) 
i  ui: downloading ui-v1.14.0.zip...

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

+  Firebase initialization complete!