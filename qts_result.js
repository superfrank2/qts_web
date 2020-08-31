$(function(){
        var data = [];
        var stock = [];
        var ArrOfFS = [];
        var temp = [];
        var response;
        var input;
        var chart;
        var pretty_data = [];
        chartIt();

        async function chartIt(){
            await get_data();
            console.log(stock);
            console.log(ArrOfFS);
            chart = new Chart(ctx,{
                type:"line",
                data:{
                    datasets:[
                    ]
                },
                options:{
                  scales:{
                    yAxes:[{
                      id:'A',
                      beginAtZero: false,
                    },
                    {
                      id:'B',
                      beginAtZero:false,
                      position:'right'
                    }
                    ]
                  }
                }
            });
            addData(chart);
       }

    
      function addData(chart){
        //borders
        for(let i = 1;i < ArrOfFS[0].length;i++){
          var temp_data = [];
          for(let j = 1;j < ArrOfFS.length-1;j++){
            temp_data.push(ArrOfFS[j][i]);
          }
          if(i == ArrOfFS[0].length-1){
            chart.data.datasets.push({
              fill:false,
              label:"投資組合資金水位",
              data:temp_data,
              borderColor:getRandomColor(),
              yAxisID: 'B',
              borderDash: [10,5]
            });
          }
          else{
            chart.data.datasets.push({
              fill:false,
              label:ArrOfFS[0][i],
              data:temp_data,
              borderColor:getRandomColor(),
              yAxisID : 'A'
            });
          }
        }
        chart.options.scales.yAxes[0].ticks.min = 800000;
        chart.options.scales.yAxes[0].stepsize = 1000;
        chart.options.scales.yAxes[1].ticks.min = 10000000;
        chart.options.scales.yAxes[1].stopsize = 100000;
        //labels
        var labels = [];
        for(let i = 1;i < ArrOfFS.length-1;i++){
          labels.push(ArrOfFS[i][0]);
        }
        chart.data.labels = labels;
        chart.update();
     }

        //get data into global array successfully.
        async function get_data() { 
            response = $.ajax({
                url:"train.csv",
                dataType:"text",
                contentType:"text.plain; charset=utf-8",
                async:false,
            }).responseText;

            console.log("push stuff first");
            input = response.split("\n");
            for(let i = 0;i < input.length;i++){
                data.push(input[i]);
            }

            //push into the global array.
            var start_get_fs = false;
            for(let i = 0;i < data.length;i++){
              temp = data[i].split(',');
              if(temp[0] == "stock#:"){
                for(let j = 1;j < temp.length;j++){
                  stock.push(temp[j]);
                }
                start_get_fs = true;
              }
              if(start_get_fs){
                ArrOfFS.push(temp);
              }
            }
        }
    
        var ctx = document.getElementById('chart');
        Chart.scaleService.updateScaleDefaults('linear', {
            ticks: {
            min: 0
        }
        });
    
 
        function getRandomColor() {
          var letters = '0123456789ABCDEF';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
          }
          return color;
        }
});