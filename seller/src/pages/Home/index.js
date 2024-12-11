import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import classNames from "classnames/bind";
import styles from "./Home.module.scss";
import { ReactComponent as OrderIcon } from "../../assets/icons/order/order.svg";
import { ReactComponent as PendingIcon } from "../../assets/icons/order/pending.svg";
import { ReactComponent as CompletedIcon } from "../../assets/icons/order/completed.svg";
import { ReactComponent as CancelledIcon } from "../../assets/icons/order/cancelled.svg";
import CurrencyFormat from "../../components/General/CurrencyFormat";
import loadingAnimation from "../../assets/animation/loading.svg";

const cx = classNames.bind(styles);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");

  const fetchDashboardStats = async (selectedRange) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:3003/orderSeller/dashboard-stats?timeRange=${selectedRange}`,
        { withCredentials: true }
      );
      setStats(data.data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(timeRange);
  }, [timeRange]);

  const chartData = {
    labels: stats?.dailyStats.map((stat) => stat._id) || [],
    datasets: [
      {
        label: "Revenue",
        data: stats?.dailyStats.map((stat) => stat.revenue) || [],
        borderColor: "#8c52ff",
        tension: 0.4,
      },
      {
        label: "Orders",
        data: stats?.dailyStats.map((stat) => stat.orders) || [],
        borderColor: "#5ce1e6",
        tension: 0.4,
      },
    ],
  };

  if (loading) {
    return (
      <div className={cx("loading-container")}>
        <img src={loadingAnimation} alt="Loading" />
      </div>
    );
  }

  return (
    <div className={cx("dashboard")}>
      <div className={cx("header")}>
        <h1>Dashboard</h1>
        <select
          className={cx("time-range")}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="month">This Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className={cx("stats-grid")}>
        {/* Total Orders */}
        <div className={cx("stat-card")}>
          <div className={cx("icon-container", "orders")}>
            <OrderIcon />
          </div>
          <div className={cx("stat-info")}>
            <h3>Total Orders</h3>
            <p>{stats?.totalOrders || 0}</p>
            <span>+{stats?.monthlyOrders || 0} this month</span>
          </div>
        </div>

        {/* Order Status */}
        <div className={cx("stat-card")}>
          <div className={cx("icon-container", "pending")}>
            <PendingIcon />
          </div>
          <div className={cx("stat-info")}>
            <h3>Pending Orders</h3>
            <p>{stats?.pendingOrders || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("icon-container", "completed")}>
            <CompletedIcon />
          </div>
          <div className={cx("stat-info")}>
            <h3>Completed Orders</h3>
            <p>{stats?.completedOrders || 0}</p>
          </div>
        </div>

        <div className={cx("stat-card")}>
          <div className={cx("icon-container", "cancelled")}>
            <CancelledIcon />
          </div>
          <div className={cx("stat-info")}>
            <h3>Cancelled Orders</h3>
            <p>{stats?.cancelledOrders || 0}</p>
          </div>
        </div>

        {/* Revenue */}
        <div className={cx("stat-card", "revenue")}>
          <div className={cx("stat-info")}>
            <h3>Total Revenue</h3>
            <p>
              <CurrencyFormat number={stats?.totalRevenue || 0} />
            </p>
            <span>
              +<CurrencyFormat number={stats?.monthlyRevenue || 0} /> this month
            </span>
          </div>
        </div>
      </div>

      {/* Charts section */}
      <div className={cx("charts-section")}>
        <div className={cx("chart-card")}>
          <h3>Revenue & Orders Overview</h3>
          <Line
            data={chartData}
            options={{
              responsive: true,
              interaction: {
                mode: "index",
                intersect: false,
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Home;
