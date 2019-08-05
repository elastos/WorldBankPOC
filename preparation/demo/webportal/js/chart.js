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
          scaleLimit: {
            min: 0.8,
            max: 4
          },
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
            symbol: 'diamond',
            symbolSize: (val)=>{
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
                color: (e)=>{
                  const isPass = e.data.hacked;
                  return !isPass ? '#0f0' : '#f00';
                },
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
      return util.requestList();
    },
  
    renderData(){
      myChart.showLoading();
      F.getData().then((data)=>{
        data = util.processData(data);
        const option = F.getOption({data});
        myChart.setOption(option);
        myChart.hideLoading();
      });

    }
  };

  window.poc = {
    showCreateNodeModal(){
      $('#js_create_modal').modal({});

      const d = util.createRandomGeoLocation();
      _.delay(()=>{
        $('#ma_peerId').val('');
        $('#ma_lat').val(d[0]);
        $('#ma_lng').val(d[1]);
        $('#ma_hacked')[0].checked = true;
      }, 100);
      
    },
    addNewNode(){
      const el = {
        peerId : $('#ma_peerId'),
        lat : $('#ma_lat'),
        lng : $('#ma_lng'),
        hacked : $('#ma_hacked')
      };

      const val = {
        peerId : el.peerId.val(),
        lat : el.lat.val(),
        lng : el.lng.val(),
        hacked : el.hacked[0].checked
      };

      if(!val.peerId){
        alert('please input peer id');
        return false;
      }

      val.json = 1;
      val.depositGasTxId = 123;
      $.ajax({
        url : '/poc/newNodeJoin',
        type : 'get',
        // dataType : 'json',
        data : val,
        success : (rs)=>{
          if(rs.code < 0){
            alert(rs.error);
            return;
          }

          alert('create success');
          console.log(rs.data);
          $('#js_create_modal').modal('hide');
        }
      });
    }
  };

  F.init();
})();