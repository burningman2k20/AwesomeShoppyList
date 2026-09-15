package com.shoppinglist.app

import android.app.Application
import com.shoppinglist.app.data.ShoppingDatabase

class ShoppingApp : Application() {
    val database: ShoppingDatabase by lazy {
        ShoppingDatabase.getDatabase(this)
    }
}
