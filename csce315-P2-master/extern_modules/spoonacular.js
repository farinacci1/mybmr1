class spoonacularClient
{
    constructor(ap)
    {
        this.apkey = ap;
    }
    query(query,numResults,callback)
    {
        let qstring = "https://api.spoonacular.com/recipes/search?apiKey="+this.apkey+"&number="+numResults+"&query="+query;
        return fetch(url);

           
    }

    getRecipeInfo(id)
    {
        let url = 'https://api.spoonacular.com/recipes/'+id+'/information?apiKey='+this.apkey+'&includeNutrition=true';
        return url;
    }
    getRecipeSummary(id)
    {
      let url = 'https://api.spoonacular.com/recipes/'+id+'/summary?apiKey='+this.apkey;
      return url;
    }

    
}
var Key = 'a123019f01964a15814a171946a3533e';
const Client = new spoonacularClient(Key);

module.exports = Client;