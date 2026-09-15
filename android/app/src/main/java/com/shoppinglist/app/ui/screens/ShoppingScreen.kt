package com.shoppinglist.app.ui.screens

import android.content.Intent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.shoppinglist.app.data.CatalogItem
import com.shoppinglist.app.data.ShoppingItem
import com.shoppinglist.app.ui.viewmodel.ShoppingViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingScreen(viewModel: ShoppingViewModel) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current

    val activeListId by viewModel.activeListId.collectAsState()
    val shoppingLists by viewModel.shoppingLists.collectAsState()
    val items by viewModel.filteredItems.collectAsState()
    val rawItems by viewModel.rawItems.collectAsState()
    val catalogItems by viewModel.catalogItems.collectAsState()
    val totalCost by viewModel.totalCost.collectAsState()
    val remainingCost by viewModel.remainingCost.collectAsState()
    val selectedStore by viewModel.selectedStore.collectAsState()
    val selectedDept by viewModel.selectedDepartment.collectAsState()

    var showAddEditDialog by remember { mutableStateOf<ShoppingItem?>(null) }
    var isNewItem by remember { mutableStateOf(false) }
    var showCatalogSheet by remember { mutableStateOf(false) }
    var showListMenu by remember { mutableStateOf(false) }

    val activeList = shoppingLists.find { it.id == activeListId }

    // Unique stores and departments for filter chips
    val availableStores = remember(rawItems) {
        rawItems.mapNotNull { it.store }.filter { it.isNotBlank() }.distinct()
    }
    val availableDepts = remember(rawItems) {
        rawItems.mapNotNull { it.department }.filter { it.isNotBlank() }.distinct()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Shopping List",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = activeList?.name ?: "Weekly Groceries",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                actions = {
                    // Catalog Sheet Button
                    IconButton(onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        showCatalogSheet = true
                    }) {
                        Icon(Icons.Outlined.Book, contentDescription = "Item Catalog")
                    }

                    // Native Android Share Intent
                    IconButton(onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                        val text = buildString {
                            appendLine("🛒 ${activeList?.name ?: "Shopping List"}")
                            appendLine("Total: $${String.format("%.2f", totalCost)}")
                            appendLine()
                            rawItems.forEach { item ->
                                val check = if (item.isChecked) "✓" else "□"
                                appendLine("$check ${item.name} (x${item.quantity}) - $${String.format("%.2f", item.cost * item.quantity)}")
                            }
                        }
                        val sendIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, text)
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(sendIntent, "Share Shopping List"))
                    }) {
                        Icon(Icons.Outlined.Share, contentDescription = "Share")
                    }

                    // Overflow Menu
                    Box {
                        IconButton(onClick = { showListMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "Options")
                        }
                        DropdownMenu(
                            expanded = showListMenu,
                            onDismissRequest = { showListMenu = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Check All") },
                                onClick = {
                                    viewModel.setAllChecked(true)
                                    showListMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.CheckCircle, null) }
                            )
                            DropdownMenuItem(
                                text = { Text("Uncheck All") },
                                onClick = {
                                    viewModel.setAllChecked(false)
                                    showListMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.RadioButtonUnchecked, null) }
                            )
                            DropdownMenuItem(
                                text = { Text("Clear Completed Items") },
                                onClick = {
                                    rawItems.filter { it.isChecked }.forEach { viewModel.deleteItem(it) }
                                    showListMenu = false
                                },
                                leadingIcon = { Icon(Icons.Default.DeleteSweep, null) }
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                    isNewItem = true
                    showAddEditDialog = ShoppingItem(
                        id = "",
                        name = "",
                        quantity = 1,
                        cost = 0.0,
                        listId = activeListId
                    )
                },
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                shape = RoundedCornerShape(16.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Item")
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Running Total Card
            ElevatedCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.elevatedCardColors(
                    containerColor = MaterialTheme.colorScheme.primaryContainer
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "RUNNING TOTAL",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$${String.format("%.2f", totalCost)}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "REMAINING UNCHECKED",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f),
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$${String.format("%.2f", remainingCost)}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                }
            }

            // Department & Store Filter Chips
            if (availableStores.isNotEmpty() || availableDepts.isNotEmpty()) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedStore == null && selectedDept == null,
                            onClick = {
                                viewModel.setFilterStore(null)
                                viewModel.setFilterDepartment(null)
                            },
                            label = { Text("All Items") }
                        )
                    }
                    items(availableStores) { store ->
                        FilterChip(
                            selected = selectedStore == store,
                            onClick = {
                                viewModel.setFilterStore(if (selectedStore == store) null else store)
                            },
                            label = { Text(store) },
                            leadingIcon = { Icon(Icons.Outlined.Store, null, modifier = Modifier.size(16.dp)) }
                        )
                    }
                    items(availableDepts) { dept ->
                        FilterChip(
                            selected = selectedDept == dept,
                            onClick = {
                                viewModel.setFilterDepartment(if (selectedDept == dept) null else dept)
                            },
                            label = { Text(dept) },
                            leadingIcon = { Icon(Icons.Outlined.Category, null, modifier = Modifier.size(16.dp)) }
                        )
                    }
                }
            }

            // Items List
            if (items.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Outlined.ShoppingCart,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = MaterialTheme.colorScheme.outline
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Shopping list is empty",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Tap + to add an item or browse the database catalog",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(items, key = { it.id }) { item ->
                        ShoppingItemRow(
                            item = item,
                            onToggle = {
                                haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                viewModel.toggleItemChecked(item)
                            },
                            onQtyChange = { delta ->
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                viewModel.updateQuantity(item, item.quantity + delta)
                            },
                            onEdit = {
                                isNewItem = false
                                showAddEditDialog = item
                            },
                            onDelete = {
                                viewModel.deleteItem(item)
                            }
                        )
                    }
                }
            }
        }
    }

    // Add / Edit Item Dialog
    showAddEditDialog?.let { currentItem ->
        AddEditItemDialog(
            item = currentItem,
            isNew = isNewItem,
            onDismiss = { showAddEditDialog = null },
            onSave = { name, qty, cost, store, dept, note ->
                viewModel.saveItem(
                    id = if (isNewItem) null else currentItem.id,
                    name = name,
                    quantity = qty,
                    cost = cost,
                    store = store,
                    department = dept,
                    note = note
                )
                showAddEditDialog = null
            }
        )
    }

    // Catalog Bottom Sheet
    if (showCatalogSheet) {
        ModalBottomSheet(
            onDismissRequest = { showCatalogSheet = false }
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                Text(
                    text = "Item Catalog",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Tap any catalog item to quickly add it to your list",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier.heightIn(max = 400.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(catalogItems) { cat ->
                        ListItem(
                            headlineContent = { Text(cat.name, fontWeight = FontWeight.SemiBold) },
                            supportingContent = {
                                Text("${cat.defaultStore ?: "Any store"} • ${cat.defaultDepartment ?: "General"}")
                            },
                            trailingContent = {
                                Text(
                                    "$${String.format("%.2f", cat.defaultCost)}",
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            },
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    viewModel.addFromCatalog(cat)
                                }
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun ShoppingItemRow(
    item: ShoppingItem,
    onToggle: () -> Unit,
    onQtyChange: (Int) -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onEdit() },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (item.isChecked)
                MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
            else
                MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Checkbox(
                checked = item.isChecked,
                onCheckedChange = { onToggle() }
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 8.dp)
            ) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.SemiBold,
                    textDecoration = if (item.isChecked) TextDecoration.LineThrough else null,
                    color = if (item.isChecked) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                )

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    item.store?.let {
                        Text(it, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
                    }
                    item.department?.let {
                        Text(it, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.secondary)
                    }
                }
            }

            // Quantity stepper & Subtotal
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { onQtyChange(-1) }, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(16.dp))
                }
                Text(
                    text = "${item.quantity}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 6.dp)
                )
                IconButton(onClick = { onQtyChange(1) }, modifier = Modifier.size(28.dp)) {
                    Icon(Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(16.dp))
                }

                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "$${String.format("%.2f", item.cost * item.quantity)}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun AddEditItemDialog(
    item: ShoppingItem,
    isNew: Boolean,
    onDismiss: () -> Unit,
    onSave: (name: String, qty: Int, cost: Double, store: String?, dept: String?, note: String?) -> Unit
) {
    var name by remember { mutableStateOf(item.name) }
    var qty by remember { mutableIntStateOf(item.quantity) }
    var costStr by remember { mutableStateOf(if (item.cost > 0) item.cost.toString() else "") }
    var store by remember { mutableStateOf(item.store ?: "") }
    var dept by remember { mutableStateOf(item.department ?: "") }
    var note by remember { mutableStateOf(item.note ?: "") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isNew) "Add Item" else "Edit Item") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Item Name *") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = costStr,
                        onValueChange = { costStr = it },
                        label = { Text("Price ($)") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    OutlinedTextField(
                        value = qty.toString(),
                        onValueChange = { qty = it.toIntOrNull() ?: 1 },
                        label = { Text("Quantity") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                }
                OutlinedTextField(
                    value = store,
                    onValueChange = { store = it },
                    label = { Text("Store (e.g. Costco, Trader Joe's)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = dept,
                    onValueChange = { dept = it },
                    label = { Text("Department (e.g. Produce, Dairy)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (name.isNotBlank()) {
                        onSave(
                            name,
                            qty,
                            costStr.toDoubleOrNull() ?: 0.0,
                            store.ifBlank { null },
                            dept.ifBlank { null },
                            note.ifBlank { null }
                        )
                    }
                },
                enabled = name.isNotBlank()
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
