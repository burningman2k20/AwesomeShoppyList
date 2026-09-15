# Shopping List - Native Android App (Jetpack Compose & Room)

This is the full native Android app implementation for **Shopping List**, built with Modern Android Development (MAD) standards.

## Tech Stack & Architecture
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material Design 3 (Material You dynamic theming)
- **Database**: Room ORM (SQLite) for persistent offline storage
- **Architecture**: MVVM with Kotlin Coroutines and StateFlow
- **Minimum SDK**: Android 8.0 (API 26)
- **Target SDK**: Android 15 (API 35)

## Features
- **Smart Shopping List**: Categorized by Store and Department
- **Running Total & Remaining Unchecked**: Automatic live subtotal calculations
- **Database Item Catalog**: One-tap item additions from preloaded or custom items
- **Filter Chips**: Real-time filtering by Store or Department
- **Native Android Share Sheet**: Share organized lists via `Intent.ACTION_SEND`
- **Native Haptics**: Tactile feedback on checking items, stepper updates, and actions

## Opening in Android Studio
1. Open **Android Studio** (Ladybug / Koala / Hedgehog or newer).
2. Select **Open** and select the `/android` folder of this project.
3. Android Studio will automatically sync the Gradle files using the Gradle Wrapper (`gradle-8.10`).
4. Connect an Android phone with USB Debugging enabled, or launch an Android Virtual Device (AVD).
5. Click **Run** (`Shift + F10`) or build an APK via **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

## Building from Terminal
```bash
cd android
./gradlew assembleDebug
```
The compiled debug APK will be generated at `app/build/outputs/apk/debug/app-debug.apk`.
