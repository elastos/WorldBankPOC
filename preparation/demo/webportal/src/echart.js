const EChart = class {
  constructor(dom, opts){
    this.dom = dom;
    this.chart = echarts.init(this.dom);

    this.user = opts.user;

    this.ori = null;


    this.buildCallback(opts);
  }
  buildCallback(opts){
    this.chart.on('click', (e)=>{
      const d = e.data;
      opts.click(d);
    });
  }

  render(data, cb){
    this.loading(true);
    data = util.processData(data);
    const option = this.getOption({data});
    this.chart.setOption(option);
    cb && cb();
    this.loading(false);
  }

  loading(f=false){
    if(f){
      this.chart.showLoading();
    }
    else{
      this.chart.hideLoading();
    }
  }

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
          min: 1,
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
          type: 'graph',
          coordinateSystem: 'geo',
          data: opts.data || [],
          symbol: (val)=>{

            const rs = this.formatDataItem(val);
            return rs.symbol;
          },
          // symbol: 'path://M832 160 192 160c-38.4 0-64 32-64 64l0 448c0 38.4 32 64 64 64l256 0 0 64L352 800C332.8 800 320 812.8 320 832c0 19.2 12.8 32 32 32l320 0c19.2 0 32-12.8 32-32 0-19.2-12.8-32-32-32L576 800l0-64 256 0c38.4 0 64-32 64-64l0-448C896 192 864 160 832 160zM832 672l-640 0 0-448 640 0 0 0L832 672z',
          symbolSize: (val)=>{
            return util.symbolSize(val[2]);
          },
          showEffectOn: ({status})=>{
            if(status === 'new_ra'){
              return 'render';
            }
            return '';
          },
          rippleEffect: {
            brushType: 'stroke'
          },
          hoverAnimation: true,
          
          label: {
            normal: {
              formatter: (e)=>{
                return this.formatLabel(e.data);
              },
              position: 'right',
              show: true
            }
          },
          itemStyle: {
            normal: {
              color: (e)=>{
                const d = e.data;

                const rs = this.formatDataItem(d);
                return rs.color;
              },
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          zlevel: 1,
          tooltip: {
            formatter: (e)=>{
              const d = e.data;
              return this.tooltipFormatter(d);
            }
          },
          links: this.formatDataLinks(opts.data),
          animation: true,
          animationDuration: (idx)=>{
            return 500;
          },
          animationDelay : (idx)=>{
            return 0;
          },
          animationDurationUpdate : (idx)=>{
            return 500;
          },
          
          animationEasingUpdate : 'cubicOut',
          animationDelayUpdate : 500
        }
      ],
      tooltip: {
        show: true
      }

    };

    return option;
  }


  tooltipFormatter(d){
    return `
      ${d.hacked ? 'Hacked <br/>' : ''}
      ${d.creditScore < 1 ? 'Untrusted <br/>' : ''}
      ${d.hacked || d.creditScore < 1 ? '<div style="height:1px; background:#cdcdcd;"></div>' : ''}
      peerId: ${d.peerId} <br/>
      score: ${d.creditScore} <br/>
      gas: ${d.gas} <br/>
    `;
  }

  formatDataLinks(data){
    const rs = [];
    let target = [];

    _.each(data, (item)=>{
      if(item.status === 'new_ra'){
        this.ori = item.name;
      }
      if((item.status === 'req_ra' && item.pd.vrf !== 'No') || item.status === 'res_ra'){
        if(item.name === this.ori) return true;

        let tar = {}; 

        if(item.status === 'req_ra'){

          tar = {
            ori : item.name,
            tar : this.ori,
            label : 'req ra'
          };
          
        }
        else{
          tar = {
            ori : this.ori,
            tar : item.name,
            label : 'res ra'
          };
        }

        target.push(tar);
      }
    });

    if(!this.ori || target.length < 1) return rs;

    _.each(target, (n)=>{
      const tmp = {
        source : n.ori,
        target : n.tar,
        lineStyle : {
          color : {
            type: 'radial',
            x: 0.5,
            y: 0.5,
            r: 0.5,
            colorStops: [{
                offset: 0, color: '#fff' // 0% 处的颜色
            }, {
                offset: 1, color: '#0f0' // 100% 处的颜色
            }],
            global: false // 缺省为 false
          },
          width : 4,
          type : 'solid',
          curveness : 0.1
        },
        symbol : ['arrow', 'arrow'],
        symbolSize : [15, 15],
        label : n.label
      }
      rs.push(tmp);
    });

    console.log(rs);
    return rs;
  }

  formatDataItem({status, pd, name}){
    const rs = {
      symbol : 'circle',
      color : '#0f0'
    };

    if(status === 'new_ra'){
      rs.color = '#ff0';

      this.ori = name;
    }
    else if(status === 'req_ra_send'){
      rs.symbol = 'rect';

      if(pd.j > 0){
        rs.color = '#f58220';
      }
      else{
        rs.color = '#ccc';
      }
    }
    else if(status === 'req_ra'){
      if(name === this.ori){
        rs.symbol = 'circle';
        rs.color = '#ff0';
      }
      else{
        rs.symbol = 'rect';
        rs.color = '#ff0';
      }

      if(pd.vrf === 'No'){
        rs.symbol = 'rect';
        rs.color = '#f00';
      }
      
    }
    else if(status === 'res_ra'){
      if(name === this.ori){
        rs.symbol = 'circle';
        rs.color = '#ff0';
      }
      else{
        rs.symbol = 'rect';
        rs.color = '#ff0';
      }
    }
    else if(_.includes(['ra_done', 'ra_reward', 'ra_penalty'], status)){
      rs.symbol = 'diamond';
      rs.color = 'cyan';

      if(status === 'ra_reward'){
        rs.color = '#0f0';
      }
      else if(status === 'ra_penalty'){
        rs.color = '#f00';
      }
    }

    if(this.user.name === name){
      // rs.color = '#eee';
    }


    return rs;
  }

  formatLabel(d){
    const {status, pd, name} = d;
    if(status === 'ra_reward'){
      return `${name} [gas+${pd.gas} credit+${pd.credit}]`;
    }
    else if(status === 'ra_penalty'){
      return `${name} [credit-${pd.credit}]`;
    }

    return name;
  }
};

module.exports = EChart;