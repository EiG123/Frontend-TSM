<script setup lang="ts">
import { onMounted, ref } from "vue";
import { PMApiService } from "../../services/pm_nodeb.api";
import {
  getRectifierConfig,
  getSiteInformationConfig,
  getKwhMeterConfig,
  getTransformerConfig,
  getGeneratorConfig,
  getSiteFacilityConfig,
  getVoltageInputConfig,
  getMdbAcConfig,
  getGroundSystemConfig,
  getExternalAlarmBeforeConfig,
  getNodeBTxConfig,
  getCabinetCheckConfig,
  getBatteryBackUpConfig,
  getTestAlarmConfig,
  getFilterConfig,
  getOnlineEq1Config,
  getOnlineEq2Config,
  getMowing1Config,
  getMowing2Config,
  getSolarCellConfig,
  getAirMaintenance1Config,
  getAirMaintenance2Config,
  getNopExternalAlarmConfig,
  getNopVerifyConfig,
  getBatteriesConfig,
} from "../../services/pmConfig.api";

const sections = ref<any[]>([]);
const form = ref<Record<string, any>>({});
const expandedCards = ref<Record<string, boolean>>({});
const expandedSections = ref<Record<string, boolean>>({});

// Batteries
const batteryConfigs = ref<any[]>([]);
const batteries = ref<Record<string, any>[]>([]);

const addBattery = () => {
  const battery: Record<string, any> = {};

  batteryConfigs.value.forEach((f) => {
    if (f.result) battery[`${f.field}_result`] = "";
    if (f.value) battery[`${f.field}_value`] = "";
    if (f.remark) battery[`${f.field}_remark`] = "";
  });

  batteries.value.push(battery);
};

const removeBattery = (index: number) => {
  batteries.value.splice(index, 1);
};

const site_id = ref("");
const node_type = ref("");
const round = ref("");
const cabinet_total = ref("");
const region = ref("");
const datetime = ref("");
const status = ref("");
const planwork = ref("");
const created_by = ref("");
const remark = ref("");

// Loading state
const isSubmitting = ref(false);

interface AllField {
  field: string;
  label: string;
  result: boolean;
  value: boolean;
  remark: boolean;
  img?: string;
  required: boolean;
}

const showPmInfo = ref(true);

// ฟังก์ชันช่วยกรอง data ตาม section
const getDataForSection = (sectionKey: string): Record<string, any> => {
  const sectionData: Record<string, any> = {};
  const section = sections.value.find((s) => s.key === sectionKey);

  if (!section || !section.fields) return sectionData;

  section.fields.forEach((field: any) => {
    if (form.value[`${field.field}_result`] !== undefined) {
      sectionData[`${field.field}_result`] =
        form.value[`${field.field}_result`];
    }
    if (form.value[`${field.field}_value`] !== undefined) {
      sectionData[`${field.field}_value`] = form.value[`${field.field}_value`];
    }
    if (form.value[`${field.field}_remark`] !== undefined) {
      sectionData[`${field.field}_remark`] =
        form.value[`${field.field}_remark`];
    }
  });
  return sectionData;
};

onMounted(async () => {
  const siteRes = await getSiteInformationConfig();
  const kwhRes = await getKwhMeterConfig();
  const transformerRes = await getTransformerConfig();
  const generatorRes = await getGeneratorConfig();
  const site_facilityRes = await getSiteFacilityConfig();
  const voltage_inputRes = await getVoltageInputConfig();
  const mdb_acRes = await getMdbAcConfig();
  const groundSysRes = await getGroundSystemConfig();
  const externalAlarmBeforeRes = await getExternalAlarmBeforeConfig();
  const nodebTxRes = await getNodeBTxConfig();
  const rectifierRes = await getRectifierConfig();
  const cabinet_checkRes = await getCabinetCheckConfig();

  // ⭐ เพิ่มการ load battery config
  const batteriesRes = await getBatteriesConfig();
  batteryConfigs.value = batteriesRes.fields || [];

  const battery_backupRes = await getBatteryBackUpConfig();
  const testAlarmRes = await getTestAlarmConfig();
  const filterRes = await getFilterConfig();
  const onlineEq1Res = await getOnlineEq1Config();
  const onlineEq2Res = await getOnlineEq2Config();
  const mowing1Res = await getMowing1Config();
  const mowing2Res = await getMowing2Config();
  const solarCellRes = await getSolarCellConfig();
  const airMaintenance1Res = await getAirMaintenance1Config();
  const airMaintenance2Res = await getAirMaintenance2Config();
  const nopExternalAlarmRes = await getNopExternalAlarmConfig();
  const nopVerifyRes = await getNopVerifyConfig();

  sections.value = [
    {
      key: "site_information",
      title: "#1 - Site Information",
      fields: siteRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "kwh_meter",
      title: "#2 - KWH Meter",
      fields: kwhRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "transformer",
      title: "#3 - Transformer *หม้อแปลงไฟฟ้า",
      fields: transformerRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "generator",
      title: "#4 - Generator *เครื่องปั่นไฟ",
      fields: generatorRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "site_facility",
      title: "#5 - Site Facility",
      fields: site_facilityRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "voltage_input",
      title: "#6 - Voltage Input",
      fields: voltage_inputRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "mdb_ac",
      title: "#7 - MDB (AC) *การทำ PM ต้อง Off Solar Cell",
      fields: mdb_acRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "groundingsystem",
      title: "#8 - Grounding System",
      fields: groundSysRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "externalalarmbefore",
      title:
        "#9 - External Alarm (Before PM) *ก่อนทำ PM ให้ตรวจสอบ alarm จาก PMBOT (-checkpmhistory SiteID)",
      fields: externalAlarmBeforeRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "nodebTx",
      title: "#10 - NodeB & TX Equipment",
      fields: nodebTxRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "rectifier",
      title: "#11 - Rectifier",
      fields: rectifierRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "cabinet_check",
      title: "#12 - Cabinet",
      fields: cabinet_checkRes.fields.filter((f: AllField) => f.result),
    },
    // ⭐ เพิ่ม Battery section ตรงนี้ (ระหว่าง #12 และ #21)
    {
      key: "batteries_section",
      title: "#13 - Batteries",
      isBatterySection: true, // flag พิเศษเพื่อแสดง battery UI
    },
    {
      key: "battery_backup",
      title: "#21 - Battery Backup",
      fields: battery_backupRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "test_alarm",
      title: "#22 - Test Alarm (-checkpm SiteID)",
      fields: testAlarmRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "filter",
      title: "#23 - แทรกสี Filter",
      fields: filterRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "onlineEq1",
      title: "#24 - Online Equipment No.1",
      fields: onlineEq1Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "onlineEq2",
      title: "#25 - Online Equipment No.2",
      fields: onlineEq2Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "mowing1",
      title: "#26 - Mowing H1 *ตัดหญ้ารอบ 1",
      fields: mowing1Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "mowing2",
      title: "#27 - Mowing H2 *ตัดหญ้ารอบ 2",
      fields: mowing2Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "solar_cell",
      title: "#28 - Solar Cell",
      fields: solarCellRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "air_maintenance1",
      title: "#29 - Air (2 times/Year) H1",
      fields: airMaintenance1Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "air_maintenance2",
      title: "#30 - Air (2 times/Year) H2",
      fields: airMaintenance2Res.fields.filter((f: AllField) => f.result),
    },
    {
      key: "nop_external_alarm", // ⭐ แก้ไข key ที่ซ้ำ
      title:
        "#31 - NOP Verify - External Alarm (After PM) *หลังทำ PM ให้ตรวจสอบ alarm จาก PMBOT",
      fields: nopExternalAlarmRes.fields.filter((f: AllField) => f.result),
    },
    {
      key: "nop_verify", // ⭐ แก้ไข key ที่ซ้ำ
      title: "#32 - NOP Verify",
      fields: nopVerifyRes.fields.filter((f: AllField) => f.result),
    },
  ];

  // init form + expanded
  sections.value.forEach((section) => {
    expandedSections.value[section.key] = true;

    // ⭐ เช็คว่าเป็น battery section หรือไม่
    if (!section.isBatterySection && section.fields) {
      section.fields.forEach((f: any) => {
        expandedCards.value[f.field] = true;

        if (f.result) form.value[`${f.field}_result`] = "";
        if (f.value) form.value[`${f.field}_value`] = "";
        if (f.remark) form.value[`${f.field}_remark`] = "";
      });
    }
  });
});

const toggleCard = (fieldName: string) => {
  expandedCards.value[fieldName] = !expandedCards.value[fieldName];
};

const togglePmInfo = () => {
  showPmInfo.value = !showPmInfo.value;
};

const toggleSection = (sectionKey: string) => {
  const isExpanded = !expandedSections.value[sectionKey];
  expandedSections.value[sectionKey] = isExpanded;

  const section = sections.value.find((s) => s.key === sectionKey);
  if (section && section.fields) {
    section.fields.forEach((f: any) => {
      expandedCards.value[f.field] = isExpanded;
    });
  }
};

const handlePmNodeB = async () => {
  try {
    isSubmitting.value = true;

    // 1. บันทึกข้อมูลหลัก PM
    const pmResult = await PMApiService.pm_nodeb(
      site_id.value,
      // node_type.value,
      // round.value,
      // cabinet_total.value,
      // region.value,
      // datetime.value,
      // status.value,
      // planwork.value,
      // created_by.value,
      // remark.value
    );

    if (!pmResult.success) {
      throw new Error("Failed to create PM record");
    }

    const pm_id = pmResult.data.id; // สมมติว่า API ส่ง PM ID กลับมา

    // 2. บันทึกข้อมูลแต่ละ section ตามลำดับ
    const siteInfoData = getDataForSection("site_information");
    await PMApiService.pm_site_information(pm_id, siteInfoData);

    // const kwhMeterData = getDataForSection("kwh_meter");
    // await PMApiService.pm_kwh_meter(pm_id, kwhMeterData);

    // const transformerData = getDataForSection("transformer");
    // await PMApiService.pm_transformer(pm_id, transformerData);

    // const generatorData = getDataForSection("generator");
    // await PMApiService.pm_generator(pm_id, generatorData);

    // const siteFacilityData = getDataForSection("site_facility");
    // await PMApiService.pm_site_facility(pm_id, siteFacilityData);

    // const voltageInputData = getDataForSection("voltage_input");
    // await PMApiService.pm_voltage_input(pm_id, voltageInputData);

    // const mdbAcData = getDataForSection("mdb_ac");
    // await PMApiService.pm_mdb_ac(pm_id, mdbAcData);

    // const groundingSystemData = getDataForSection("groundingsystem");
    // await PMApiService.pm_grounding_system(pm_id, groundingSystemData);

    // const externalAlarmBeforeData = getDataForSection("externalalarmbefore");
    // await PMApiService.pm_external_alarm_before(pm_id, externalAlarmBeforeData);

    // const nodebTxData = getDataForSection("nodebTx");
    // await PMApiService.pm_nodeb_tx(pm_id, nodebTxData);

    // const rectifierData = getDataForSection("rectifier");
    // await PMApiService.pm_rectifier(pm_id, rectifierData);

    // const cabinetCheckData = getDataForSection("cabinet_check");
    // await PMApiService.pm_cabinet_check(pm_id, cabinetCheckData);

    // 3. บันทึก Batteries (ถ้ามี)
    // if (batteries.value.length > 0) {
    //   await PMApiService.pm_batteries(pm_id, batteries.value);
    // }

    // const batteryBackupData = getDataForSection("battery_backup");
    // await PMApiService.pm_battery_backup(pm_id, batteryBackupData);

    // const testAlarmData = getDataForSection("test_alarm");
    // await PMApiService.pm_test_alarm(pm_id, testAlarmData);

    // const filterData = getDataForSection("filter");
    // await PMApiService.pm_filter(pm_id, filterData);

    // const onlineEq1Data = getDataForSection("onlineEq1");
    // await PMApiService.pm_online_eq1(pm_id, onlineEq1Data);

    // const onlineEq2Data = getDataForSection("onlineEq2");
    // await PMApiService.pm_online_eq2(pm_id, onlineEq2Data);

    // const mowing1Data = getDataForSection("mowing1");
    // await PMApiService.pm_mowing1(pm_id, mowing1Data);

    // const mowing2Data = getDataForSection("mowing2");
    // await PMApiService.pm_mowing2(pm_id, mowing2Data);

    // const solarCellData = getDataForSection("solar_cell");
    // await PMApiService.pm_solar_cell(pm_id, solarCellData);

    // const airMaintenance1Data = getDataForSection("air_maintenance1");
    // await PMApiService.pm_air_maintenance1(pm_id, airMaintenance1Data);

    // const airMaintenance2Data = getDataForSection("air_maintenance2");
    // await PMApiService.pm_air_maintenance2(pm_id, airMaintenance2Data);

    // const nopExternalAlarmData = getDataForSection("nop_external_alarm");
    // await PMApiService.pm_nop_external_alarm(pm_id, nopExternalAlarmData);

    // const nopVerifyData = getDataForSection("nop_verify");
    // await PMApiService.pm_nop_verify(pm_id, nopVerifyData);

    // 4. สำเร็จ - redirect
    alert("บันทึกข้อมูลสำเร็จ!");
    window.location.href = "/home";
  } catch (error) {
    console.error("Submit failed:", error);
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="handlePmNodeB">
    <!-- PM Information Section -->
    <div class="section-card">
      <div class="section-header" @click="togglePmInfo">
        <h2>PM Information</h2>
        <button type="button" class="toggle-btn">
          {{ showPmInfo ? "−" : "+" }}
        </button>
      </div>

      <transition name="slide">
        <div v-show="showPmInfo" class="box">
          <div class="card">
            <div class="form-group">
              <label>Site ID :</label>
              <input v-model="site_id" type="text" name="site_id" required />
            </div>

            <div class="form-group">
              <label>Node Type</label>
              <select v-model="node_type" name="node_type">
                <option value="">Select...</option>
                <option value="NodeB">NodeB</option>
                <option value="SmallExchange">Small Exchange</option>
                <option value="MediumExchange">Medium Exchange</option>
                <option value="Boardband">Boardband</option>
                <option value="Mowing">Mowing</option>
                <option value="SolarCell">Solar Cell</option>
              </select>
            </div>

            <div class="form-group">
              <label>Round :</label>
              <input v-model="round" type="text" name="round" />
            </div>

            <div class="form-group">
              <label>Cabinet Total :</label>
              <input v-model="cabinet_total" type="text" name="cabinet_total" />
            </div>

            <div class="form-group">
              <label>Region</label>
              <input v-model="region" type="text" name="region" />
            </div>

            <div class="form-group">
              <label>PM Date</label>
              <input v-model="datetime" type="datetime-local" name="datetime" />
            </div>

            <div class="form-group">
              <label>Site Status</label>
              <input v-model="status" type="text" name="status" />
            </div>

            <div class="form-group">
              <label>Planwork</label>
              <input v-model="planwork" type="text" name="planwork" />
            </div>

            <div class="form-group">
              <label>Created by</label>
              <input v-model="created_by" type="text" name="created_by" />
            </div>

            <div class="form-group">
              <label>Remark</label>
              <input v-model="remark" type="text" name="remark" />
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Dynamic Sections -->
    <div v-for="section in sections" :key="section.key" class="section-card">
      <!-- ⭐ กรณีเป็น Battery Section แสดง UI แบบพิเศษ -->
      <template v-if="section.isBatterySection">
        <div class="section-header" @click="toggleSection(section.key)">
          <h2>{{ section.title }}</h2>
          <div class="header-buttons">
            <button
              type="button"
              @click.stop="addBattery"
              class="add-battery-btn"
            >
              + Add Battery
            </button>
            <button type="button" class="toggle-btn">
              {{ expandedSections[section.key] ? "−" : "+" }}
            </button>
          </div>
        </div>

        <transition name="slide">
          <div v-show="expandedSections[section.key]" class="card-content">
            <div v-if="batteries.length === 0" class="no-batteries">
              <p>No batteries added yet. Click "+ Add Battery" to add one.</p>
            </div>

            <div
              v-for="(battery, index) in batteries"
              :key="index"
              class="field-card battery-card"
            >
              <div class="card-header">
                <h3>Battery #{{ index + 1 }}</h3>
                <button
                  type="button"
                  @click="removeBattery(index)"
                  class="remove-btn"
                >
                  × Remove
                </button>
              </div>

              <div class="field-content">
                <div
                  v-for="f in batteryConfigs"
                  :key="f.field"
                  class="input-group"
                >
                  <label>
                    {{ f.label }}
                    <span v-if="f.required" class="text-red-500">*</span>
                  </label>

                  <input
                    v-if="f.result"
                    v-model="battery[`${f.field}_result`]"
                    class="form-input"
                    placeholder="Enter result"
                  />

                  <input
                    v-if="f.value"
                    v-model="battery[`${f.field}_value`]"
                    type="number"
                    class="form-input"
                    placeholder="Enter value"
                  />

                  <textarea
                    v-if="f.remark"
                    v-model="battery[`${f.field}_remark`]"
                    class="form-input"
                    placeholder="Enter remark"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </template>

      <!-- ⭐ กรณีเป็น Section ปกติ -->
      <template v-else>
        <div class="section-header" @click="toggleSection(section.key)">
          <h2>{{ section.title }}</h2>
          <button type="button" class="toggle-btn">
            {{ expandedSections[section.key] ? "−" : "+" }}
          </button>
        </div>

        <transition name="slide">
          <div v-show="expandedSections[section.key]" class="card-content">
            <div v-for="f in section.fields" :key="f.field" class="field-card">
              <div class="card-header" @click="toggleCard(f.field)">
                <h3>
                  {{ f.label }}
                  <span v-if="f.required" class="text-red-500">*</span>
                </h3>
                <button type="button" class="toggle-btn-small">
                  {{ expandedCards[f.field] ? "−" : "+" }}
                </button>
              </div>

              <transition name="slide">
                <div v-show="expandedCards[f.field]" class="field-content">
                  <div v-if="f.result" class="input-group">
                    <label>Result</label>
                    <input
                      v-model="form[`${f.field}_result`]"
                      class="form-input"
                      placeholder="Enter result"
                    />
                  </div>

                  <div v-if="f.value" class="input-group">
                    <label>Value</label>
                    <input
                      v-model="form[`${f.field}_value`]"
                      type="number"
                      class="form-input"
                      placeholder="Enter value"
                    />
                  </div>

                  <div v-if="f.remark" class="input-group">
                    <label>Remark</label>
                    <textarea
                      v-model="form[`${f.field}_remark`]"
                      class="form-input"
                      placeholder="Enter remark"
                      rows="3"
                    />
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </transition>
      </template>
    </div>

    <div class="submit-container">
      <button type="submit" class="submit-btn">Submit</button>
    </div>
  </form>
</template>

<style scoped>
/* เพิ่ม styles สำหรับ battery section */
.header-buttons {
  display: flex;
  gap: 10px;
  align-items: center;
}

.add-battery-btn {
  background-color: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.add-battery-btn:hover {
  background-color: #059669;
}

.remove-btn {
  background-color: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.battery-card {
  border-left: 4px solid #10b981;
  margin-bottom: 16px;
}

.no-batteries {
  padding: 32px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

/* Section Card */
.section-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e9ecef;
}

.section-header:hover {
  background: #e9ecef;
}

.section-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #212529;
}

/* Card Content Container */
.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Field Cards */
.field-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.field-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  cursor: pointer;
  user-select: none;
  border-bottom: 1px solid #e9ecef;
}

.card-header:hover {
  background: #f8f9fa;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
}

.field-content {
  padding: 16px;
  background: white;
}

/* Toggle Buttons */
.toggle-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.2s ease;
}

.toggle-btn:hover {
  background: #0056b3;
  transform: scale(1.1);
}

.toggle-btn-small {
  width: 24px;
  height: 24px;
  border: none;
  background: #6c757d;
  color: white;
  border-radius: 50%;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s ease, transform 0.2s ease;
}

.toggle-btn-small:hover {
  background: #5a6268;
  transform: scale(1.1);
}

/* Form Groups */
.box {
  padding: 0;
}

.card {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  padding: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

/* Input Groups in Field Cards */
.input-group {
  margin-bottom: 14px;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-group label {
  display: block;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}

/* Submit Button */
.submit-container {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.submit-btn {
  padding: 12px 48px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.submit-btn:hover {
  background: #218838;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

/* Required Indicator */
.text-red-500 {
  color: #dc3545;
  margin-left: 4px;
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .card {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 1.1rem;
  }

  .card-header h3 {
    font-size: 0.95rem;
  }
}
</style>