(()=>{
  let myChart = null;
  const F = {
    initChart(){
      myChart = echarts.init($('#echart-div')[0]);

      myChart.on('click', (e)=>{
        const d = e.data;
        if(!d) return false;

        const el = $('#js_node_detail');
        el.data('json', d).modal('show');
        _.delay(()=>{
          el.find('.js_title').html('Peer : '+ d.name);
          el.find('.js_score').html(d.creditScore);
          el.find('.js_geo').html(d.value.join(' - '));
          el.find('.js_hash').html(d.potHash);
        }, 100);
      });
    },
    init(){
      F.initChart();
      console.log('init chart');
      myChart.showLoading();
      F.renderData(()=>{
        myChart.hideLoading();
      });
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
            // symbol: 'diamond',
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
                  return !isPass ? '#0f0' : '#ff0';
                },
                shadowBlur: 10,
                shadowColor: '#333'
              }
            },
            zlevel: 1,
            tooltip: {
              formatter(e){
                const d = e.data;
                return `
                peerId: ${d.peerId} <br/>
                score: ${d.creditScore}
                `;
              }
            }
          }
        ],
        tooltip: {
          show: true
        }

      };

      return option;
    },

    getData(){
      return util.requestList();
    },
  
    renderData(cb){
      F.getData().then((data)=>{
        data = util.processData(data);
        const option = F.getOption({data});
        myChart.setOption(option);
        cb && cb();
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
      val.depositGasTxId = 'test_123';
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

          F.renderData();
        }
      });
    },
    addCreditScore(score){
      const d = $('#js_node_detail').data('json');
      const val = {
        peerId : d.peerId,
        score : _.add(d.creditScore, score),
        json : 1
      };

      $.ajax({
        url : '/poc/setPeerScore',
        type : 'get',
        data : val,
        success : (rs)=>{
          if(rs.code < 0){
            alert(rs.error);
            return false;
          }
          alert('success');

          $('#js_node_detail').modal('hide');
          F.renderData();
        }
      });
    },
    deleteNode(){
      const d = $('#js_node_detail').data('json');
      const val = {
        peerId : d.peerId,
      };

      $.ajax({
        url : '/poc/deletePot',
        type : 'get',
        data : val,
        success : (rs)=>{
          if(rs.code < 0){
            alert(rs.error);
            return false;
          }
          alert('success');

          $('#js_node_detail').modal('hide');
          F.renderData();
        }
      });
    }
  };

  F.init();
})();