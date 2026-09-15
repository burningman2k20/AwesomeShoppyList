package com.shoppinglist.app.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [ShoppingItem::class, CatalogItem::class, ShoppingListEntity::class],
    version = 1,
    exportSchema = false
)
abstract class ShoppingDatabase : RoomDatabase() {
    abstract fun shoppingDao(): ShoppingDao

    companion object {
        @Volatile
        private var INSTANCE: ShoppingDatabase? = null

        fun getDatabase(context: Context): ShoppingDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ShoppingDatabase::class.java,
                    "shopping_database"
                )
                .addCallback(DatabaseCallback())
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    CoroutineScope(Dispatchers.IO).launch {
                        populateInitialCatalog(database.shoppingDao())
                    }
                }
            }

            suspend fun populateInitialCatalog(dao: ShoppingDao) {
                val defaultList = ShoppingListEntity(id = "default", name = "Weekly Groceries")
                dao.insertList(defaultList)

                val defaultCatalog = listOf(
                    CatalogItem("c1", "Bananas", 1.29, "Trader Joe's", "Produce"),
                    CatalogItem("c2", "Organic Milk", 4.99, "Whole Foods", "Dairy"),
                    CatalogItem("c3", "Sourdough Bread", 3.89, "Safeway", "Bakery"),
                    CatalogItem("c4", "Free Range Eggs (12pk)", 4.49, "Trader Joe's", "Dairy"),
                    CatalogItem("c5", "Chicken Breast", 8.99, "Costco", "Meat & Seafood"),
                    CatalogItem("c6", "Avocados", 3.49, "Trader Joe's", "Produce"),
                    CatalogItem("c7", "Olive Oil Extra Virgin", 11.99, "Costco", "Pantry")
                )
                defaultCatalog.forEach { dao.insertCatalogItem(it) }

                // Initial shopping items
                val initialItems = listOf(
                    ShoppingItem("i1", "Bananas", 1, 1.29, false, "Trader Joe's", "Produce", listId = "default"),
                    ShoppingItem("i2", "Organic Milk", 2, 4.99, false, "Whole Foods", "Dairy", listId = "default"),
                    ShoppingItem("i3", "Sourdough Bread", 1, 3.89, true, "Safeway", "Bakery", listId = "default")
                )
                dao.insertItems(initialItems)
            }
        }
    }
}
