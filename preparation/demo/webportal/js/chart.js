(()=>{
  let myChart = null;
  const F = {
    initChart(){
      myChart = echarts.init($('#echart-div')[0]);
    },
    init(){
      F.initChart();
      console.log('init chart');
      
      F.renderData();
    },

    getOption(opts={}){
      const option = {
        backgroundColor: '#000',
        geo: {
          map: 'world',
          silent: true,
          label: {
              emphasis: {
                  show: false,
                  areaColor: '#fff'
              }
          },
          itemStyle: {
              normal: {
                  borderWidth: 0.2,
                  borderColor: 'red'
              }
          },
          left: 24,
          top: 50,
          // bottom: '%',
          right: 24,
          roam: true,
          itemStyle: {
              normal: {
                areaColor: '#323c48',
                borderColor: '#eee'
              }
          }
        },

        series : [
          {
            name: 'node',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: opts.data || [],
            symbolSize: (val)=>{
              console.log(util.symbolSize(val[2]))
              return util.symbolSize(val[2]);
            },
            showEffectOn: 'render',
            rippleEffect: {
                brushType: 'stroke'
            },
            hoverAnimation: true,
            label: {
                normal: {
                  formatter: '{b}',
                  position: 'right',
                  show: true
                }
            },
            itemStyle: {
                normal: {
                  color: '#0f0',
                  shadowBlur: 10,
                  shadowColor: '#333'
                }
            },
            zlevel: 1
          }
        ]

      };

      return option;
    },

    getData(){
      const testData = [
        {
          name : '1',
          geo : [11.11, 22.22],
          credit : 10,
        },
        {
          name : '2',
          geo : [22.22, 33.33],
          credit : 32
        },
        {
          name : '3',
          geo : [33.33, 44.44],
          credit : 100
        }
      ];

      return Promise.resolve(testData);
    },
    processData(data){
      return _.map(data, (item)=>{
        item.value = [...item.geo, item.credit];
        return item;
      });
    },
    renderData(){
      myChart.showLoading();
      F.getData().then((data)=>{
        data = F.processData(data);
        const option = F.getOption({data});
        myChart.setOption(option);
        myChart.hideLoading();
      });

    }
  };

  F.init();
})();