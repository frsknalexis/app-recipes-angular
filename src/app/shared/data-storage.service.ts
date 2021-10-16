import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RecipeService } from "../recipes/recipe.service";
import {Recipe} from "../recipes/recipe.model";
import {map, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class DataStorageService {

  constructor(private httpClient: HttpClient, private recipeService: RecipeService) {
  }

  storeRecipes() {
    const recipes = this.recipeService.getRecipes();
    this.httpClient.put('https://ng-recipe-book-5fd54-default-rtdb.firebaseio.com/recipes.json',
      recipes)
      .subscribe((response) => {
        console.log(response);
      });
  }

  fetchRecipes() {
    return this.httpClient.get<Recipe[]>('https://ng-recipe-book-5fd54-default-rtdb.firebaseio.com/recipes.json')
      .pipe(map((recipes) => {
        return recipes.map((recipe) => {
          return {...recipe, ingredients: recipe.ingredients ? recipe.ingredients : []};
        })
      }), tap((recipes) => {
        console.log(recipes);
        this.recipeService.setRecipes(recipes);
      }));
  }
}
