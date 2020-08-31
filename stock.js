$(function(){
        
        var data = [];
        var input;
        $.ajax({
            url:"output.csv",
            dataType:"text",
            contentType:"text.plain; charset=utf-8",
            success:function(response)
            {
                input = response.split("\n");
                for(let i = 1;i < input.length;i++){
                    data.push(input[i]);
                }
            }
        });

        console.log(data);

        var days = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
        var line = data[20];
        var m = data[21];
        var daily_risk = data[22];
        var trend = data[23];


        var each_row = [];
        var the_index;
        var intc_index;
        var nke_index;
        $.ajax({
            url:"train.csv",
            dataType:"text",
            contentType:"text.plain; charset = utf-8",
            success:function(response){
                console.log("success");
               each_row = response.split("\n"); 
               var first_row = each_row[0].split(",");
               for(let i = 0;i < first_row.length;i++){
                   if(first_row[i] == mcd) the_index = i;
                   else if (first_row[i]==intc) intc_index = i;
                   else if (first_row[i]==nke) nke_index = i;
               }
               console.log(each_row.length);
               for(let j = 1;j<each_row.length;j++){
                   var temp = each_row[j].split(",");
                   mcd_data.push(temp[the_index]);
                   intc_data.push(temp[intc_index]);
                   nke_data.push(temp[nke_index]);
               }
            }
        });
        var ctx = document.getElementById('chart');
        Chart.scaleService.updateScaleDefaults('linear', {
    ticks: {
        min: 0
    }
});
        var line_chart = new Chart(ctx,{
            type:'line',
            data: {
                labels:days,
                datasets:[{
                    fill:false,
                    label:'資金水位',
                    data: data
                },
                    {
                        fill:false,
                        label:"MCN",
                        data:mcd_data,
                        borderColor: "#FF0000"
                    },
                    {
                        fill:false,
                        label:"INTC",
                        data:intc_data,
                        borderColor: "#73B839"
                    },
                    {
                        fill:false,
                        label:"NKE",
                        data : nke_data,
                        borderColor : "#FFBF00"
                    },
                    {
                        fill:false,
                        label:"趨勢線",
                        data :[{
                            x:0,
                            y:10000000
                        },{
                            x:20,
                            y:20*45235.79286 + 10000000
                        }],
                        borderColor :"#00477D"
                    },
                ]
            }
        });

});