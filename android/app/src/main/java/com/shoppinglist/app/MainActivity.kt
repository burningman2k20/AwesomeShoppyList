package com.shoppinglist.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.shoppinglist.app.ui.screens.ShoppingScreen
import com.shoppinglist.app.ui.theme.ShoppingListTheme
import com.shoppinglist.app.ui.viewmodel.ShoppingViewModel
import com.shoppinglist.app.ui.viewmodel.ShoppingViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: ShoppingViewModel by viewModels {
        val app = application as ShoppingApp
        ShoppingViewModelFactory(app.database.shoppingDao())
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ShoppingListTheme {
                ShoppingScreen(viewModel = viewModel)
            }
        }
    }
}
