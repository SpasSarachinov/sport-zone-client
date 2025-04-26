import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { toast } from "react-toastify";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import {
  OrderStatus,
  getOrderStatusText,
  getOrderStatusColor,
} from "../enums/OrderStatus";

interface Order {
  id: string;
  userId: string;
  names: string;
  postalCode: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  status: OrderStatus;
  createdOn: string;
  orderTotalPrice: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    title: string;
  }>;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGE_SIZE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState('createdOn');
  const [sortDescending, setSortDescending] = useState(true);
  const { token, user } = useSelector((state: RootState) => state.auth);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("bg-BG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, sortBy, sortDescending]);

  const fetchOrders = async () => {
    try {
      const queryParams = new URLSearchParams({
        PageNumber: currentPage.toString(),
        PageSize: itemsPerPage.toString(),
        SortBy: sortBy,
        SortDescending: sortDescending.toString(),
        UserId: user?.id || ''
      });

      const response = await fetch(
        `https://sportzone-api.onrender.com/api/Orders/get-list?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      console.log("Orders API response:", data);

      let ordersArray = [];
      if (Array.isArray(data)) {
        ordersArray = data;
      } else if (data && data.items && Array.isArray(data.items)) {
        ordersArray = data.items;
        if (data.totalCount) {
          setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
        }
      }

      setOrders(ordersArray);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Грешка при зареждането на поръчките");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(
        `https://sportzone-api.onrender.com/api/Orders/change-status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            orderStatus: OrderStatus.Cancelled,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      toast.success("Поръчката беше отменена успешно");
      fetchOrders();
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Грешка при отменяне на поръчката");
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Моите поръчки</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="sortBy" className="text-sm text-gray-700">
                Сортирай по:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="createdOn">Дата</option>
                <option value="orderTotalPrice">Сума</option>
                <option value="status">Статус</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sortOrder" className="text-sm text-gray-700">
                Посока:
              </label>
              <select
                id="sortOrder"
                value={sortDescending ? 'desc' : 'asc'}
                onChange={(e) => setSortDescending(e.target.value === 'desc')}
                className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="desc">Низходящо</option>
                <option value="asc">Възходящо</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-gray-700">
                Брой на страница:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!loading && orders && orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Нямате направени поръчки</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {orders &&
                orders.map((order) => (
                  <div
                    key={order?.id || Math.random()}
                    className="bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">
                            Поръчка #{order?.id ? order.id.slice(0, 8) : "N/A"}
                          </h2>
                          <p className="text-sm text-gray-500">
                            Дата:{" "}
                            {order?.createdOn
                              ? formatDate(order.createdOn)
                              : "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(
                              order?.status || OrderStatus.Created
                            )}`}
                          >
                            {getOrderStatusText(
                              order?.status || OrderStatus.Created
                            )}
                          </span>
                          {order?.status !== OrderStatus.Cancelled && (
                            <button
                              onClick={() =>
                                order?.id && handleCancelOrder(order.id)
                              }
                              className="flex items-center text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md"
                            >
                              <XMarkIcon className="h-5 w-5 mr-1" />
                              Отмени поръчка
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">
                            Обща сума:
                          </span>
                          <span className="text-lg font-semibold text-gray-900">
                            {new Intl.NumberFormat("bg-BG", {
                              style: "currency",
                              currency: "BGN",
                            }).format(order?.orderTotalPrice || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-primary-500 hover:bg-primary-600"
                  } text-white`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-gray-700">
                  Страница {currentPage} от {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-primary-500 hover:bg-primary-600"
                  } text-white`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
