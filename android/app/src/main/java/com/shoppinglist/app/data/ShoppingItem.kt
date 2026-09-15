package com.shoppinglist.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "shopping_items")
data class ShoppingItem(
    @PrimaryKey val id: String,
    val name: String,
    val quantity: Int = 1,
    val cost: Double = 0.0,
    val isChecked: Boolean = false,
    val store: String? = null,
    val department: String? = null,
    val note: String? = null,
    val listId: String = "default"
)

@Entity(tableName = "catalog_items")
data class CatalogItem(
    @PrimaryKey val id: String,
    val name: String,
    val defaultCost: Double = 0.0,
    val defaultStore: String? = null,
    val defaultDepartment: String? = null
)

@Entity(tableName = "shopping_lists")
data class ShoppingListEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: Long = System.currentTimeMillis()
)
