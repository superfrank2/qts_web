
function QTS(filename,element,beta,input_stocks,iteration_time,init_money,control){

    class gb_node{
        constructor(size,trend){
            this.sol = [];
            this.trend = trend;
            this.iteration = 0;
            for(let i = 0;i < size;i++) this.sol.push(false);
        }
    }

   //Global constant variables.
    //const input_stocks = ["AAPL","AXP","BA","CAT","CSCO","CVX","DIS","DD","GS","HD","IBM","INTC","JNJ","JPM","KO","MCD","MMM","MRK","MSFT","NKE","PFE","PG","TRV","UNH","UTX","V","VZ","WBA","WMT","XOM"];
    //Global variabels.
    var stock_arr = []; // Read the whole csv file into response and parse it .
    var chances = [];
    var population = [];
    var input_stocks_columns = [];
    var output_fs = [];
    var all_fs = [];
    var current_gbest = new gb_node(input_stocks.length,0);
    function get_data(filename){
        stock_arr = [];
        var response = $.ajax({
            url:filename,
            dataType:"text",
            contentType:"text.plain; charset=utf-8",
            async:false
        }).responseText;

        var temp = response.split("\n");
        for(let i = 0;i < temp.length;i++){
            stock_arr.push(temp[i].split(","));
        }
    }

    function init_population(){
        chances = [];
        population = [];
        var stocks_n = input_stocks.length;
        for(let i = 0;i < element;i++){
            let temp = [];
            for(let j = 0;j < stocks_n;j++) temp.push(false);
            population.push(temp);
        }
        for(let i = 0;i < input_stocks.length;i++){
            chances.push(0.5);
        }
    }

    function measurement(){
        if(chances.length ===  input_stocks.length && population.length === element){
            for(let i = 0;i < population.length;i++){
                for(let j = 0;j < population[i].length;j++){
                    let rand_num = Math.random()*1+0;
                    if(chances[j] >= rand_num) population[i][j] = true;
                    else population[i][j] = false;
                }
            }
        }
        else{
            console.log("measurement error!");
        }
    }

    function getcolumns(){
        input_stocks_columns = [];
        for(let i = 0;i < input_stocks.length;i++){
            for(let j = 0;j < stock_arr[0].length;j++){
                if(stock_arr[0][j] == input_stocks[i]) input_stocks_columns.push(j);
            }
        }
    }

    function the_fs(solution){
        //reset something 
        output_fs = [];
        all_fs = [];
        //get indexes of inputtockscolumns.
        var indexes = [];
        for(let i = 0;i < solution.length;i++){
            if(solution[i]) indexes.push(input_stocks_columns[i]);
        }
        var n = indexes.length;
        //
        var sep_left = 0;
        var arr = [];
        var last_stockN = [];
        var single_left = [];
        //count trend.
        for(let i = 0;i < stock_arr.length - 1;i++){
            var temp = [];
            if(i==0);
            else if(i==1){
                var avg_money = init_money/n;
                var result = 0;
                sep_left = init_money - avg_money * n;
                for(let j = 0;j < n;j++){
                    var today_stock = stock_arr[i][indexes[j]];
                    var could_buy = avg_money/today_stock;
                    var left = avg_money - could_buy * today_stock;
                    var single_money = today_stock * could_buy + left;
                    temp.push(single_money);
                    last_stockN.push(could_buy);
                    single_left.push(left);
                }
                output_fs.push(temp);
                for(let k = 0;k < temp.length;k++) result = result + temp[k];
                result = result + sep_left;
                arr.push(result);
            }
            else{
                var result = 0;
                for(let j = 0;j < n;j++){
                    var today_stock = stock_arr[i][indexes[j]];
                    var single_money = last_stockN[j] * today_stock + single_left[j];
                    temp.push(single_money);
                }
                output_fs.push(temp);
                for(let k = 0;k < temp.length;k++){
                    result = result + temp[k];
                }
                result = result + sep_left;
                arr.push(result);
            }
        }

        //
        var xi = 0;
        var sum = 0;
        var daily_risk = 0;
        var trend = 0;
        var days = arr.length;
        for(let k = 0;k < arr.length;k++){
            sum += (arr[k] - init_money) * (k+1);
            xi = (k+1)*(k+1) + xi;
        }
        var m = sum/xi;
        for(let k = 0;k < arr.length;k++){
            var tmp = 0;
            tmp = arr[k] - (m * (k +1) + init_money);
            tmp = tmp*tmp/days;
            daily_risk += tmp;
        }
        daily_risk = Math.sqrt(daily_risk);
        trend = (((m*days + init_money) - init_money)/days)/daily_risk;
        all_fs = arr;
        return trend;
    }

    function fitness(iteration,control){
        var max = 0;
        var min = 10000000;
        var best = [];
        var worst = [];
        var update = [];
        for(let i = 0;i < population.length;i++){
           // console.log(population[i]);
            var m = the_fs(population[i]);
            if(m >max){
                max = m;
                best = population[i];
            }
            if(m < min){
                min = m;
                worst = population[i];
            }
        }

        if(max > current_gbest.trend){
            current_gbest.sol = best;
            current_gbest.trend = max;
            current_gbest.iteration = iteration;
            console.log("current best gb is" + current_gbest.sol);
            console.log("with trend = " +current_gbest.trend); 
            console.log("Found in iteration:" + current_gbest.iteration);
        }

        if(control === 'QTS'){
            for(let i = 0;i < best.length;i++){
                if(best[i] && worst[i]) update.push(0);
                else if(best[i] && !worst[i]) update.push(beta);
                else if(!best[i] && worst[i]) update.push(0-beta);
                else update.push(0);
            }
        }
        else if(control === 'GQTS'){
            for(let i = 0;i < current_gbest.sol.length;i++){
                if(current_gbest.sol[i] && worst[i]) update.push(0);
                else if(current_gbest.sol[i] && !worst[i]) update.push(beta);
                else if(!current_gbest.sol[i] && worst[i]) update.push(0 - beta);
                else update.push(0);
            }
        }
        else if(control === 'GNQTS'){
            for(let i = 0;i < current_gbest.sol.length;i++){
                if(current_gbest.sol[i] && worst[i]) update.push(0);
                else if(current_gbest.sol[i] && !worst[i]){
                    if(chances[i] < 0.5) chances[i] = 1 - chances[i];
                    update.push(beta);
                }
                else if(!current_gbest.sol[i] && worst[i]){
                    if(chances[i] > 0.5) chances[i] = 1 - chances[i];
                    update.push(0 - beta);
                }
                else update.push(0);
            }
        }
        else{
            console.log('control parameter error');
            return 0;
        }

       for(let i = 0;i < chances.length;i++) chances[i] += update[i];
    }

    function qts_algo(){
        get_data(filename);
        init_population();
        getcolumns();
        for(let iteration = 1;iteration <= iteration_time;iteration++){
            measurement();
            fitness(iteration,control);
        }
    }

    qts_algo();

    return{
        return: current_gbest
    }

}

