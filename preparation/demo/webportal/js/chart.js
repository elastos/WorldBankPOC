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
          el.find('.js_gas').html(d.gas);
          el.find('.js_geo').html(d.location.join(' - '));
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
            // symbol: 'path://M832 160 192 160c-38.4 0-64 32-64 64l0 448c0 38.4 32 64 64 64l256 0 0 64L352 800C332.8 800 320 812.8 320 832c0 19.2 12.8 32 32 32l320 0c19.2 0 32-12.8 32-32 0-19.2-12.8-32-32-32L576 800l0-64 256 0c38.4 0 64-32 64-64l0-448C896 192 864 160 832 160zM832 672l-640 0 0-448 640 0 0 0L832 672z',
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
                  const d = e.data;
                  if(d.hacked){
                    return '#f00';
                  }
                  if(d.creditScore < 1){
                    return '#ff0';
                  }

                  return '#0f0';
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
                ${d.hacked ? 'Hacked <br/>' : ''}
                ${d.creditScore < 1 ? 'Untrusted <br/>' : ''}
                ${d.hacked || d.creditScore < 1 ? '<div style="height:1px; background:#cdcdcd;"></div>' : ''}
                peerId: ${d.peerId} <br/>
                score: ${d.creditScore} <br/>
                gas: ${d.gas} <br/>
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
        $('#ma_leo').val(10);
        $('#ma_lat').val(d[0]);
        $('#ma_lng').val(d[1]);
        $('#ma_hacked')[0].checked = false;
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

      const amt = $('#ma_leo').val();
      if(!amt || parseInt(amt) < 10){
        alert('invalid LEO number');
        return false;
      }

      $.ajax({
        url : '/poc/faucetGasToPeer',
        type : 'get',
        data : {
          json : 1,
          peerId : val.peerId,
          amt : amt
        }
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
        return $.ajax({
          url : '/poc/newJoinNodeDeposit',
          type : 'get',
          data : {
            json : 1,
            peerId : val.peerId,
            depositGasAmt : amt
          }
        })
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
        val.json = 1;
        val.depositGasTxId = rs.data.gasTransactionId._id;

        return $.ajax({
          url : '/poc/newNodeJoin',
          type : 'get',
          // dataType : 'json',
          data : val
        });
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }

        alert('create success');
        console.log(rs.data);
        $('#js_create_modal').modal('hide');

        F.renderData();
      });

    },
    setCreditScore(){
      const val = parseInt(prompt('please input the number you what to set', '10'), 10);

      if(_.isNumber(val) && !_.isNaN(val)){
        poc.addCreditScore(val, true);
      }
      else{
        alert('invalid input');
      }
  
    },
    addCreditScore(score, f=false){
      const d = $('#js_node_detail').data('json');
      score = !f ? _.add(d.creditScore, score) : score;
      const val = {
        peerId : d.peerId,
        score,
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
    },

    showTxLogs(){
      const d = $('#js_node_detail').data('json');
      $.ajax({
        url : '/poc/txLogs/'+d.name,
        type : 'get',
        data : {}
      }).then((rs)=>{
        console.log(rs);
        $('#js_node_detail').modal('hide');
        $('#js_tx_logs').modal('show');

        _.delay(()=>{
          let html = '';
          const x = 'style="justify-content: space-between;display:flex;"';
          _.each(rs.data, (item)=>{
            html += `
              <li ${x} class="list-group-item"><b>From Peer Id</b> <span>${item.fromPeerId}</span></li>
              <li ${x} class="list-group-item"><b>To Peer Id</b> <span>${item.toPeerId}</span></li>
              <li ${x} class="list-group-item"><b>Amount</b> <span>${item.amt}</span></li>
              <li ${x} class="list-group-item"><b>Type</b> <span>${item.referenceEventType}</span></li>
              <li ${x} class="list-group-item"><b>Token Type</b> <span>${item.tokenType}</span></li>
              <li ${x} class="list-group-item"><b>Update Time</b> <span>${item.updatedAt}</span></li>
              <li style="list-style:none;"><h4></h4></li>
            `;
          });
          
          $('#js_tx_logs').find('.js_box').html(html);
        }, 100);
      });
    },

    setGasBalance(){
      const val = parseInt(prompt('please input the number you what to add', '10'), 10);
      const d = $('#js_node_detail').data('json');
      if(_.isNumber(val) && !_.isNaN(val)){
        set();
      }
      else{
        alert('invalid input');
      }

      
      function set(){
        $.ajax({
          url : '/poc/faucetGasToPeer',
          type : 'get',
          data : {
            json : 1,
            peerId : d.name,
            amt : val
          }
        }).then((rs)=>{
          if(rs.code < 0){
            alert(rs.error);
            return false;
          }

          alert('success');
          $('#js_node_detail').modal('hide');
          F.renderData();
        })
      }
    },

    tryRA(){
      const d = $('#js_node_detail').data('json');
      $.ajax({
        url : '/poc/tryRa',
        type : 'get',
        data : {
          peerId : d.name,
          potHash : d.potHash,
          json : 1
        }
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }
        if(rs.data.currentRaConsensusResult){
          alert(rs.data.currentRaConsensusResult.message);
          return false;
        }
      })
    },

    createGenesisNode(){
      $.ajax({
        url : '/poc/createGenesisPot',
        type : 'get',
        data : {
          json : 1
        }
      }).then((rs)=>{
        if(rs.code < 0){
          alert(rs.error);
          return false;
        }

        alert('success');
        F.renderData();
      })
    },

    refresh(){
      F.renderData();
    }
  };

  F.init();
})();