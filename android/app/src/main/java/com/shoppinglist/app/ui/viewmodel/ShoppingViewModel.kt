package com.shoppinglist.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.shoppinglist.app.data.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.UUID

class ShoppingViewModel(private val dao: ShoppingDao) : ViewModel() {

    private val _activeListId = MutableStateFlow("default")
    val activeListId: StateFlow<String> = _activeListId.asStateFlow()

    private val _selectedStore = MutableStateFlow<String?>(null)
    val selectedStore: StateFlow<String?> = _selectedStore.asStateFlow()

    private val _selectedDepartment = MutableStateFlow<String?>(null)
    val selectedDepartment: StateFlow<String?> = _selectedDepartment.asStateFlow()

    val shoppingLists: StateFlow<List<ShoppingListEntity>> = dao.getAllLists()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val catalogItems: StateFlow<List<CatalogItem>> = dao.getAllCatalogItems()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val rawItems: StateFlow<List<ShoppingItem>> = _activeListId
        .flatMapLatest { listId -> dao.getItemsForList(listId) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val filteredItems: StateFlow<List<ShoppingItem>> = combine(
        rawItems,
        _selectedStore,
        _selectedDepartment
    ) { items, store, dept ->
        items.filter { item ->
            (store == null || item.store.equals(store, ignoreCase = true)) &&
            (dept == null || item.department.equals(dept, ignoreCase = true))
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val totalCost: StateFlow<Double> = rawItems.map { items ->
        items.sumOf { it.cost * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val remainingCost: StateFlow<Double> = rawItems.map { items ->
        items.filter { !it.isChecked }.sumOf { it.cost * it.quantity }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    fun setActiveList(listId: String) {
        _activeListId.value = listId
    }

    fun setFilterStore(store: String?) {
        _selectedStore.value = store
    }

    fun setFilterDepartment(dept: String?) {
        _selectedDepartment.value = dept
    }

    fun toggleItemChecked(item: ShoppingItem) {
        viewModelScope.launch {
            dao.updateItem(item.copy(isChecked = !item.isChecked))
        }
    }

    fun updateQuantity(item: ShoppingItem, newQuantity: Int) {
        viewModelScope.launch {
            if (newQuantity <= 0) {
                dao.deleteItem(item)
            } else {
                dao.updateItem(item.copy(quantity = newQuantity))
            }
        }
    }

    fun saveItem(
        id: String?,
        name: String,
        quantity: Int,
        cost: Double,
        store: String?,
        department: String?,
        note: String?
    ) {
        viewModelScope.launch {
            val item = ShoppingItem(
                id = id ?: UUID.randomUUID().toString(),
                name = name.trim(),
                quantity = quantity.coerceAtLeast(1),
                cost = cost.coerceAtLeast(0.0),
                store = store?.trim()?.ifEmpty { null },
                department = department?.trim()?.ifEmpty { null },
                note = note?.trim()?.ifEmpty { null },
                listId = _activeListId.value
            )
            dao.insertItem(item)
        }
    }

    fun deleteItem(item: ShoppingItem) {
        viewModelScope.launch {
            dao.deleteItem(item)
        }
    }

    fun clearList() {
        viewModelScope.launch {
            dao.clearList(_activeListId.value)
        }
    }

    fun setAllChecked(checked: Boolean) {
        viewModelScope.launch {
            dao.setAllChecked(_activeListId.value, checked)
        }
    }

    fun addFromCatalog(catalogItem: CatalogItem) {
        saveItem(
            id = null,
            name = catalogItem.name,
            quantity = 1,
            cost = catalogItem.defaultCost,
            store = catalogItem.defaultStore,
            department = catalogItem.defaultDepartment,
            note = null
        )
    }

    fun createList(name: String) {
        viewModelScope.launch {
            val newList = ShoppingListEntity(
                id = UUID.randomUUID().toString(),
                name = name.trim()
            )
            dao.insertList(newList)
            _activeListId.value = newList.id
        }
    }
}

class ShoppingViewModelFactory(private val dao: ShoppingDao) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ShoppingViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ShoppingViewModel(dao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
