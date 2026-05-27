import { createRouter, createWebHistory } from "vue-router";
import { RouteLocationNormalized } from 'vue-router'

import Login from "../views/login.vue";
import Register from "../views/register.vue";
import Home from "../views/home.vue";
import PM from "../views/PM.vue";
import NotFound from "../views/NotFound.vue";
import profile from "../views/profile.vue";

import devDashboard from "../views/dev/DevManage.vue";
import DevUserManage from "../views/dev/UserManage.vue";
import DevUserEdit from "../views/dev/UserEdit.vue";
import logMornitor from "../views/dev/logMornitor.vue";

import AdminManage from "../views/admin/AdminManage.vue";
import userManage from "../views/admin/UserManage.vue";
import userEdit from "../views/admin/UserEdit.vue";
import RoleManage from "../views/dev/RoleManage.vue";
import userPermissionEdit from "../views/dev/userPermissionEdit.vue";
import AddPermission from "../views/dev/AddPermission.vue";
import TitleManagement from "../views/admin/TitleManagement.vue";
import UserlocationDashboard from "../views/admin/UserlocationDashboard.vue";

import pm_nodeb from "../views/pm/pm_page.vue";
import pm_nodeb_new from "../views/pm/pm_nodeb_new.vue";
import pm_site_detail from "../views/pm/pm_site_detail.vue";
import pm_site_detail_site_data from "../views/pm/pm_site_detail_site_data.vue";
import pm_site_detail_site_data_data from "../views/pm/pm_site_detail_site_data_data.vue";
import pm_site_detail_site_data_enter_data from "../views/pm/pm_site_detail_site_data_enter_data.vue";
import pm_site_detail_site_info from "../views/pm/pm_site_detail_site_info.vue";

import pmDashBoardAI from "../views/pmDashBoard/pmDashBoardAI.vue";

import pm_enter_data from "../views/pm/pm_enter_data.vue";
import pm_add_cabinet from "../views/pm/pm_add_cabinet.vue";
import pm_cabinet_page from "../views/pm/pm_cabinet_page.vue";
import pm_cabinet_detail_page from "../views/pm/pm_cabinet_detail_page.vue";

import pm_title from "../views/pm/title/pm_title.vue";
import pm_title_add from "../views/pm/title/pm_title_add.vue";
import pm_title_edit from "../views/pm/title/pm_title_edit.vue";
import pm_title_child from "../views/pm/title/pm_title_child.vue";
import pm_title_child_add from "../views/pm/title/pm_title_child_add.vue";
import pm_title_child_edit from "../views/pm/title/pm_title_child_edit.vue";

import pm_dropdown from "../views/pm/title/pm_dropdown.vue";
import pm_dropdown_add from "../views/pm/title/pm_dropdown_add.vue";
import pm_dropdown_member from "../views/pm/title/pm_dropdown_member.vue";
import pm_dropdown_member_add from "../views/pm/title/pm_dropdown_member_add.vue";

import cableslack from "../views/cableslack/cableslack.vue";

import txt_to_excel from "../views/txt_to_excel/home.vue";

import network_availability_dashboard from "../views/NetworkAvailability/NetworkAvailabilityDashBoard.vue";
import Site_Improvement from "../views/Site Improvement/SiteImprovement.vue";

import MainNetworkAVA from "../views/NetworkAvailability/MainNetworkAvailability.vue";

import network_availability_upload_sites_ava from "../views/NetworkAvailability/UploadSiteAVA.vue";
import network_availability_upload_incident_ticket from "../views/NetworkAvailability/UploadIncidentTT.vue";
import network_availability_sites_and_incident from "../views/NetworkAvailability/DashBoardNetworkAVA.vue";
import network_availability_sites_and_incident_ALL from "../views/NetworkAvailability/DashBoardNetworkAVA_ALL.vue";

import MainCableOpticFiber from "../views/CableFiberOptic/MainCableFiberOptic.vue";

import CableFiberOpticUpload from "../views/CableFiberOptic/CableFiberOpticUpload.vue";
import CableFiberOpticViews from "../views/CableFiberOptic/CableFiberOpticViews.vue";
import CableFiberOpticDetail from "../views/CableFiberOptic/CableFiberOpticDetail.vue";

import siteLocationView from "../views/Sites/sitesLocationView.vue";

import Top100NetworkAVA from "../views/NetworkAvailability/UploadTop100SiteAVA.vue";


const routes = [
    // 🔐 Login (ไม่มี layout)
    {
        path: "/",
        name: "login",
        component: Login,
    },

    {
        path: "/home",
        name: "home",
        component: Home,
        meta: {
            requiresAuth: true
        }
    },

    {
        path: "/register",
        name: "register",
        component: Register,
    },
    {
        path: "/profile",
        name: "profile",
        component: profile,
    },
    {
        path: "/dev",
        meta: {
            requiresAuth: true,
            permissions: ["dev"]
        },
        children: [
            {
                path: "logMornitor",
                name: "logMornitor",
                component: logMornitor,
            },
            {
                path: "devDashboard",
                name: "devDashboard",
                component: devDashboard,
            },
            {
                path: "RoleManage",
                name: "RoleManage",
                component: RoleManage,
            },
            {
                path: "/user/permissionedit",
                name: "userPermissionEdit",
                component: userPermissionEdit,
                props: (route: RouteLocationNormalized) => ({
                    id: route.query.id,
                })
            },
            {
                path: "/AddPermission",
                name: "AddPermission",
                component: AddPermission,
            },
            {
                path: "/dev/userManage",
                component: DevUserManage,
            },
            {
                path: "/dev/userEdit",
                component: DevUserEdit,
                props: (route: RouteLocationNormalized) => ({
                    id: route.query.id,
                })
            },
        ]
    },

    {
        path: "/admin",
        meta: {
            requiresAuth: true,
            permissions: ["admin"]
        },
        children: [
            {
                path: "adminDashboard",
                name: "adminDashboard",
                component: AdminManage,
            },
            {
                path: "userManage",
                name: "userManage",
                component: userManage,
            },
            {
                path: "/user/edit",
                name: "userEdit",
                component: userEdit,
                props: (route: RouteLocationNormalized) => ({
                    id: route.query.id,
                })
            },
            {
                path: "TitleManagement",
                name: "TitleManagement",
                component: TitleManagement,
            },
            {
                path: "UserlocationDashboard",
                name: "UserlocationDashboard",
                component: UserlocationDashboard
            }
        ]
    },
    {
        path: "/MainCableOpticFiber",
        name: "MainCableOpticFiber",
        meta: {
            requiresAuth: true
        },
        component: MainCableOpticFiber

    },
    {
        path: "/MainNetworkAVA",
        name: "MainNetworkAVA",
        meta: {
            requiresAuth: true
        },
        component: MainNetworkAVA

    },
    {
        path: "/siteLocationView",
        name: "siteLocationView",
        meta: {
            requiresAuth: true
        },
        component: siteLocationView
    },
    {
        path: "/Top100NetworkAVA",
        name: "Top100NetworkAVA",
        meta: {
            requiresAuth: true
        },
        component: Top100NetworkAVA
    },
    {

        path: "/CableFiberOpticDetail",
        name: "CableFiberOpticDetail",
        meta: {
            requiresAuth: true
        },
        component: CableFiberOpticDetail,
        props: (route: RouteLocationNormalized) => ({
            id: route.query.id,
        })
    },
    {

        path: "/CableFiberOpticUpload",
        name: "CableFiberOpticUpload",
        meta: {
            requiresAuth: true
        },
        component: CableFiberOpticUpload,
    },
    {

        path: "/CableFiberOpticViews",
        name: "CableFiberOpticViews",
        meta: {
            requiresAuth: true
        },
        component: CableFiberOpticViews,
    },

    {
        path: "/network_availability_sites_and_incident_ALL",
        meta: {
            requiresAuth: true
        },
        component: network_availability_sites_and_incident_ALL,
    },

    {
        path: "/network_availability_sites_and_incident",
        meta: {
            requiresAuth: true
        },
        component: network_availability_sites_and_incident,
    },

    {
        path: "/network_availability_upload_sites_ava",
        meta: {
            requiresAuth: true
        },
        component: network_availability_upload_sites_ava,
    },

    {
        path: "/network_availability_upload_incident_ticket",
        meta: {
            requiresAuth: true
        },
        component: network_availability_upload_incident_ticket,
    },

    {
        path: "/network_availability_dashboard",
        meta: {
            requiresAuth: true
        },
        component: network_availability_dashboard,
    },

    {
        path: "/pmDashBoardAI",
        meta: {
            requiresAuth: true
        },
        component: pmDashBoardAI,
    },

    {
        path: "/Site_Improvement",
        name: "Site_Improvement",
        meta: {
            requiresAuth: true
        },
        component: Site_Improvement,
        props: (route: RouteLocationNormalized) => ({
            region: route.query.region,
        })
    },

    // 🧱 Main layout (ต้อง login)
    {
        path: "/",
        meta: {
            requiresAuth: true
            ,
            permissions: ["PM"]
        },
        children: [
            {
                path: "PM",
                name: "PM",
                component: PM,
            },
            {
                path: "pm_nodeb",
                name: "pm_nodeb",
                component: pm_nodeb,
            },
            {
                path: "pm_page",
                name: "pm_page",
                component: pm_nodeb,
                props: (route: RouteLocationNormalized) => ({
                    type: route.query.type,
                })
            },
            {
                path: "pm_nodeb_new",
                name: "pm_nodeb_new",
                component: pm_nodeb_new,
                props: (route: RouteLocationNormalized) => ({
                    type: route.query.type,
                }),
            },
            {
                path: "pm_site_detail",
                name: "pm_site_detail",
                component: pm_site_detail,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.id,
                    type: route.query.type,
                }),
            },
            {
                path: "pm_site_detail_site_data",
                name: "pm_site_detail_site_data",
                component: pm_site_detail_site_data,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                    type: route.query.type,
                }),
            },
            {
                path: "pm_site_detail_site_info",
                name: "pm_site_detail_site_info",
                component: pm_site_detail_site_info,
                props: (route: RouteLocationNormalized) => ({
                    id: route.query.id,
                    type: route.query.type,
                })
            },
            {
                path: "pm_site_detail_site_data_data",
                name: "pm_site_detail_site_data_data",
                component: pm_site_detail_site_data_data,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                    key: route.query.key,
                    type: route.query.type,
                })

            },
            {
                path: "pm_site_detail_site_data_enter_data",
                name: "pm_site_detail_site_data_enter_data",
                component: pm_site_detail_site_data_enter_data,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                    title: route.query.title,
                    title_id: route.query.title_id,
                    order_number: route.query.order_number,
                })
            },
            {
                path: "pm_enter_data",
                name: "pm_enter_data",
                component: pm_enter_data,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                    title_id: route.query.title_id,
                    title_child_id: route.query.title_child_id,
                    order_number: route.query.order_number,
                })
            },
            {
                path: "pm_add_cabinet",
                name: "pm_add_cabinet",
                component: pm_add_cabinet,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                })
            },
            {
                path: "pm_cabinet_page",
                name: "pm_cabinet_page",
                component: pm_cabinet_page,
                props: (route: RouteLocationNormalized) => ({
                    pmId: route.query.pmId,
                })
            },
            {
                path: "pm_cabinet_detail_page",
                name: "pm_cabinet_detail_page",
                component: pm_cabinet_detail_page,
                props: (route: RouteLocationNormalized) => ({
                    cabinetId: route.query.cabinet_id
                })
            },
            {
                path: "pm_title",
                name: "pm_title",
                component: pm_title
            },
            {
                path: "pm_title_edit/:id",
                name: "pm_title_edit",
                component: pm_title_edit,
                props: true
            },
            {
                path: "pm_dropdown",
                name: "pm_dropdown",
                component: pm_dropdown,
            },
            {
                path: "pm_dropdown_add",
                name: "pm_dropdown_add",
                component: pm_dropdown_add,
            },
            {
                path: "pm_dropdown_member/:id",
                name: "pm_dropdown_member",
                component: pm_dropdown_member,
                props: true,
            },
            {
                path: "pm_dropdown_member/:id",
                name: "pm_dropdown_member",
                component: pm_dropdown_member,
                props: true,
            },
            {
                path: "pm_dropdown_member_add/:id",
                name: "pm_dropdown_member_add",
                component: pm_dropdown_member_add,
                props: true,
            },
            {
                path: "pm_title_add",
                name: "pm_title_add",
                component: pm_title_add
            },
            {
                path: "pm_title_child/:id",
                name: "pm_title_child",
                component: pm_title_child,
                props: true
            },
            {
                path: "pm_title_child_edit",
                name: "pm_title_child_edit",
                component: pm_title_child_edit,
                props: (route: RouteLocationNormalized) => ({
                    title_id: route.query.title_id,
                    title_child_id: route.query.title_child_id,
                })
            },
            {
                path: "pm_title_child_add/:id",
                name: "pm_title_child_add",
                component: pm_title_child_add,
                props: true
            },
            {
                path: "cableslack",
                name: "cableslack",
                component: cableslack,
            },
            {
                path: "txt_to_excel",
                name: "txt_to_excel",
                component: txt_to_excel,
            }
        ],
    },

    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFound
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, _from, next) => {
    const { useAuthStore } = await import("../stores/auth");
    const authStore = useAuthStore();

    const isAuthenticated = authStore.isAuthenticated;

    // 1️⃣ ถ้าหน้านั้นต้อง login
    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: "login" });
    }

    // 2️⃣ ถ้า login แล้วพยายามกลับไป login
    if (to.name === "login" && isAuthenticated) {
        return next({ name: "home" });
    }

    // 3️⃣ ถ้ามีการกำหนด permission
    if (to.meta.permissions) {
        const required = to.meta.permissions as string[];

        const hasAll = required.every(p =>
            authStore.hasPermission(p)
        );

        console.log(hasAll);

        if (!hasAll) {
            return next({ name: "forbidden" });
        }
    }

    next();
});

export default router;