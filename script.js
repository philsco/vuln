// https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml
// https://services.nvd.nist.gov/rest/json/cves/1.0/

//Date range
//https://services.nvd.nist.gov/rest/json/cves/1.0/?modStartDate=2021-08-04T13:00:00:000 UTC%2B01:00&modEndDate=2021-10-22T13:36:00:000 UTC%2B01:00

const today = new Date().toISOString();

let state = { startDate: today, endDate: today, cveDesc: [], totCves: 0 };

const updateDates = (tgt, value) => {
  const toISO = new Date(value).toISOString();
  state = Object.assign({}, state, { [tgt]: new Date(value).toISOString() });
  console.log(state);
}
const res = document.getElementById('results');
const sDate = document.getElementById('startDate');
const eDate = document.getElementById('endDate');
const todayFmt = today.substring(0, 10);
sDate.value = todayFmt;
eDate.value = todayFmt;

sDate.addEventListener('change', function(e) { updateDates('startDate', e.target.value) });

eDate.addEventListener('change', function(e) { updateDates('endDate', e.target.value) });

const render = (data) => {
  let list = document.createElement('ul');
  list.setAttribute('class', 'list-group');

  data.forEach((item, idx) => {
    const elem = document.createElement('li');
    elem.setAttribute('class', 'list-group-item');
    elem.setAttribute('id', idx);
    elem.innerHTML = item.id + " -- " + item.desc;
    list.append(elem);
  })
  res.append(list);
}

const genAlert = (message) => {
  res.innerHTML = '';
  const alert = document.createElement('div');
  alert.setAttribute('class', 'alert alert-warning');
  alert.innerHTML = message;
  res.append(alert);
}

const getData = async () => {
  const start = state.startDate.substring(0, 13);
  const end = state.endDate.substring(0, 13);
  res.innerHTML = 'Getting Data...'

  let URL = 'https://services.nvd.nist.gov/rest/json/cves/1.0/?modStartDate=' + start + ':00:00:000%20UTC%2B01:00&modEndDate=' + end + ':36:00:000%20UTC%2B01:00';

  fetch(URL,
    {
      method: 'GET',
      //mode: 'no-cors',
    })
    .then(response => {
      if (!response.ok) {
        genAlert(response?.status)
        return;
      } else {
        return response.json()
      }
    })
    .then(data => {
      if (data) {
        state = Object.assign({}, state, { totCves: data.totalResults });

        const cveArr = data.result.CVE_Items.map(item => {
          return {
            id: item.cve.CVE_data_meta.ID,
            desc: item.cve.description.description_data[0].value
            /*                    
                              sev: item.impact.baseMetricV3 
                              ?impact.baseMetricV3.cvssV3.baseSeverity
                              :'' 
            */
          }
        })
        res.innerHTML = '';
        return render(cveArr);
      }
    })
    .catch(err => {
      genAlert(err.message);
    })
}