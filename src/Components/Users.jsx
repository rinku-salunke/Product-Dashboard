import { useState, useEffect, useCallback, useRef } from "react";

function Users() {
  // ---------- State ----------
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting
  const [sortOption, setSortOption] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Filter
  const [filterKey, setFilterKey] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filterError, setFilterError] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Single user detail
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // 🛒 User carts
  const [userCarts, setUserCarts] = useState(null);
  const [cartsLoading, setCartsLoading] = useState(false);
  const [cartsError, setCartsError] = useState(null);
  const [showCarts, setShowCarts] = useState(false);

  // Ref
  const valueInputRef = useRef(null);

  // Filter keys
  const filterKeys = [
    {
      label: "Hair Color",
      value: "hair.color",
      examples: "Brown, Blonde, Black, Red",
    },
    {
      label: "Hair Type",
      value: "hair.type",
      examples: "Curly, Straight, Wavy",
    },
    { label: "Eye Color", value: "eyeColor", examples: "Green, Blue, Brown" },
    { label: "Gender", value: "gender", examples: "male, female" },
    { label: "Blood Group", value: "bloodGroup", examples: "O+, A+, B+, AB+" },
    { label: "Role", value: "role", examples: "admin, moderator, user" },
  ];

  const [sortBy, order] = sortOption ? sortOption.split("_") : [null, null];

  // ---------- Fetch all users ----------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        let url = "https://dummyjson.com/users";
        if (sortBy && order) {
          url += `?sortBy=${sortBy}&order=${order}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [sortBy, order]);

  // ---------- Search ----------
  const searchUsers = useCallback(
    async (query) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setSearchedUsers([]);
        setIsSearching(false);
        setSearchError(null);
        return;
      }
      try {
        setIsSearching(true);
        setSearchError(null);
        let url = `https://dummyjson.com/users/search?q=${encodeURIComponent(trimmed)}`;
        if (sortBy && order) {
          url += `&sortBy=${sortBy}&order=${order}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setSearchedUsers(data.users || []);
      } catch (err) {
        setSearchError(err.message || "Search failed");
        setSearchedUsers([]);
      } finally {
        setIsSearching(false);
      }
    },
    [sortBy, order],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  // ---------- Filter ----------
  const filterUsers = useCallback(
    async (key, value) => {
      if (!key || !value) {
        setFilteredUsers([]);
        setIsFiltering(false);
        setFilterError(null);
        return;
      }
      try {
        setIsFiltering(true);
        setFilterError(null);
        const url = `https://dummyjson.com/users/filter?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        let results = data.users || [];
        if (sortBy && order) {
          results.sort((a, b) => {
            let valA = a[sortBy] ?? "";
            let valB = b[sortBy] ?? "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }
        setFilteredUsers(results);
      } catch (err) {
        setFilterError(err.message || "Filter failed");
        setFilteredUsers([]);
      } finally {
        setIsFiltering(false);
      }
    },
    [sortBy, order],
  );

  useEffect(() => {
    filterUsers(filterKey, filterValue);
  }, [filterKey, filterValue, filterUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterKey, filterValue, searchTerm]);

  useEffect(() => {
    if (filterKey && valueInputRef.current) {
      valueInputRef.current.focus();
    }
  }, [filterKey]);

  // ---------- Determine which users to display ----------
  let displayUsers = users;
  let isDisplayLoading = loading;
  let displayError = error;

  if (filterKey && filterValue) {
    displayUsers = filteredUsers;
    isDisplayLoading = isFiltering;
    displayError = filterError;
  } else if (searchTerm.trim()) {
    displayUsers = searchedUsers;
    isDisplayLoading = isSearching;
    displayError = searchError;
  }

  // ---------- Fetch single user ----------
  useEffect(() => {
    if (selectedUserId === null) {
      setSelectedUser(null);
      setDetailError(null);
      setShowCarts(false); // Reset carts view when returning to list
      return;
    }

    const fetchUserDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await fetch(
          `https://dummyjson.com/users/${selectedUserId}`,
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        setSelectedUser(data);
      } catch (err) {
        setDetailError(err.message || "Failed to load user details");
      } finally {
        setDetailLoading(false);
      }
    };

    fetchUserDetail();
  }, [selectedUserId]);

  // ---------- Fetch user carts when showCarts is true ----------
  useEffect(() => {
    if (showCarts && selectedUserId) {
      const fetchCarts = async () => {
        try {
          setCartsLoading(true);
          setCartsError(null);
          const res = await fetch(
            `https://dummyjson.com/carts/user/${selectedUserId}`
          );
          if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
          const data = await res.json();
          setUserCarts(data.carts || []);
        } catch (err) {
          setCartsError(err.message || "Failed to load carts");
        } finally {
          setCartsLoading(false);
        }
      };
      fetchCarts();
    } else {
      setUserCarts(null);
      setCartsError(null);
    }
  }, [showCarts, selectedUserId]);

  // ---------- Pagination ----------
  const totalUsers = displayUsers.length;
  const totalPages = Math.min(Math.ceil(totalUsers / itemsPerPage), 10);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = displayUsers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ---------- Handlers ----------
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (filterKey && filterValue) {
      setFilterKey("");
      setFilterValue("");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchedUsers([]);
    setSearchError(null);
  };

  const handleFilterKeyChange = (e) => {
    setFilterKey(e.target.value);
    setFilterValue("");
    if (searchTerm) {
      setSearchTerm("");
    }
  };

  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  const clearFilter = () => {
    setFilterKey("");
    setFilterValue("");
    setFilteredUsers([]);
    setFilterError(null);
  };

  const handleSortOptionChange = (e) => {
    setSortOption(e.target.value);
  };

  const toggleCarts = () => {
    setShowCarts((prev) => !prev);
  };

  const currentFilterLabel =
    filterKeys.find((k) => k.value === filterKey)?.label || filterKey;
  const currentFilterExamples =
    filterKeys.find((k) => k.value === filterKey)?.examples || "";

  // ---------- Loading & Error for list ----------
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-sm text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
        <p className="font-semibold">Oops! Something went wrong.</p>
        <p className="text-xs mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl text-xs hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ---------- Detail View ----------
  if (selectedUserId !== null) {
    if (detailLoading) {
      return (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-sm text-gray-400">Loading user details...</p>
        </div>
      );
    }

    if (detailError) {
      return (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
          <p className="font-semibold">Failed to load user details</p>
          <p className="text-xs mt-1">{detailError}</p>
          <button
            onClick={handleBackToList}
            className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-xl text-xs hover:bg-gray-600 transition"
          >
            Back to Users
          </button>
        </div>
      );
    }

    if (!selectedUser) return null;

    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Users
        </button>

        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-6 shadow-xl">
          {/* User Info */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={
                selectedUser.image ||
                `https://i.pravatar.cc/150?img=${selectedUser.id}`
              }
              alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-700"
            />
            <div>
              <h2 className="text-xl font-bold text-white">
                {selectedUser.firstName} {selectedUser.lastName}
              </h2>
              <p className="text-sm text-gray-400">@{selectedUser.username}</p>
              <p className="text-xs text-gray-500 capitalize">
                {selectedUser.role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="text-gray-200">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="text-gray-200">{selectedUser.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Age</p>
              <p className="text-gray-200">{selectedUser.age}</p>
            </div>
            <div>
              <p className="text-gray-500">Gender</p>
              <p className="text-gray-200 capitalize">{selectedUser.gender}</p>
            </div>
            <div>
              <p className="text-gray-500">Blood Group</p>
              <p className="text-gray-200">{selectedUser.bloodGroup}</p>
            </div>
            <div>
              <p className="text-gray-500">Birth Date</p>
              <p className="text-gray-200">{selectedUser.birthDate}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500">Address</p>
              <p className="text-gray-200">
                {selectedUser.address?.address}, {selectedUser.address?.city},{" "}
                {selectedUser.address?.state} {selectedUser.address?.postalCode}
                , {selectedUser.address?.country}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-gray-500">Company</p>
              <p className="text-gray-200">
                {selectedUser.company?.name} – {selectedUser.company?.title} (
                {selectedUser.company?.department})
              </p>
            </div>
          </div>

          {/* 🛒 View Carts Button */}
          <div className="mt-6 pt-4 border-t border-gray-800">
            <button
              onClick={toggleCarts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-sm font-semibold transition border border-blue-500/30"
            >
              <span>{showCarts ? "Hide" : "View"} Carts</span>
            </button>
          </div>

          {/* Carts Section */}
          {showCarts && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              {cartsLoading ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading carts...</span>
                </div>
              ) : cartsError ? (
                <div className="text-red-400 text-sm">{cartsError}</div>
              ) : userCarts && userCarts.length > 0 ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-300">
                    Shopping Carts ({userCarts.length})
                  </h4>
                  {userCarts.map((cart) => (
                    <div
                      key={cart.id}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-gray-300">
                          Cart #{cart.id}
                          <span className="text-gray-500 ml-2">
                            ({cart.totalProducts} products, {cart.totalQuantity}{" "}
                            items)
                          </span>
                        </span>
                        <span className="text-blue-400 font-semibold">
                          ${cart.total}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {cart.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-700/50 pb-1 last:border-0"
                          >
                            <span>
                              {product.title} × {product.quantity}
                            </span>
                            <span>${product.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-sm">No carts found for this user.</div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- List View ----------
  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white">Manage User Accounts</h2>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Sort */}
          <select
            value={sortOption}
            onChange={handleSortOptionChange}
            className="bg-gray-950 border border-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">No Sorting (Default)</option>
            <option value="firstName_asc">First Name (A-Z)</option>
            <option value="firstName_desc">First Name (Z-A)</option>
            <option value="lastName_asc">Last Name (A-Z)</option>
            <option value="lastName_desc">Last Name (Z-A)</option>
            <option value="age_asc">Age (Low to High)</option>
            <option value="age_desc">Age (High to Low)</option>
            <option value="email_asc">Email (A-Z)</option>
            <option value="email_desc">Email (Z-A)</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 sm:w-48">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-500 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter */}
          <select
            value={filterKey}
            onChange={handleFilterKeyChange}
            className="bg-gray-950 border border-gray-800 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="">Filter by...</option>
            {filterKeys.map((key) => (
              <option key={key.value} value={key.value}>
                {key.label}
              </option>
            ))}
          </select>

          {filterKey && (
            <div className="relative">
              <input
                ref={valueInputRef}
                type="text"
                placeholder={`Enter ${currentFilterLabel}...`}
                value={filterValue}
                onChange={handleFilterValueChange}
                className="w-full sm:w-36 bg-gray-950 border border-gray-800 text-gray-200 placeholder-gray-500 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 transition"
              />
              {filterValue && (
                <button
                  onClick={clearFilter}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Active filters/search */}
      {filterKey && filterValue && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Filtering by:</span>
          <span className="text-blue-400 font-medium">
            {currentFilterLabel} = "{filterValue}"
          </span>
          <button
            onClick={clearFilter}
            className="text-gray-500 hover:text-white text-xs"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {filterKey && !filterValue && (
        <div className="flex items-center gap-2 text-sm text-yellow-400">
          <span>⚠️</span>
          <span>Please enter a value to filter by {currentFilterLabel}.</span>
          {currentFilterExamples && (
            <span className="text-gray-500 text-xs">
              (e.g. {currentFilterExamples})
            </span>
          )}
        </div>
      )}

      {searchTerm.trim() && !filterKey && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">Search results for:</span>
          <span className="text-blue-400 font-medium">"{searchTerm}"</span>
        </div>
      )}

      {filterError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
          {filterError}
        </div>
      )}

      {searchError && !filterKey && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
          {searchError}
        </div>
      )}

      {isDisplayLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-3 text-sm text-gray-400">
            {filterKey && filterValue ? "Filtering..." : "Searching..."}
          </p>
        </div>
      )}

      {!isDisplayLoading && currentUsers.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-sm">
            {filterKey && filterValue
              ? `No users found with ${currentFilterLabel} = "${filterValue}"`
              : searchTerm.trim()
                ? `No users found for "${searchTerm}"`
                : "No users found."}
          </p>
        </div>
      )}

      {!isDisplayLoading && currentUsers.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 shadow-xl hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-blue-500/10"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={
                      user.image || `https://i.pravatar.cc/100?img=${user.id}`
                    }
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-xs text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-gray-300">
                  <p>
                    <span className="text-gray-500">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span> {user.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">Role:</span>{" "}
                    <span className="capitalize">{user.role}</span>
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                  <span className="text-blue-400 text-xs font-medium hover:underline">
                    View Profile →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-gray-800/80">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs disabled:opacity-40 hover:bg-gray-800 transition-all cursor-pointer"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentPage === pageNumber
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-500"
                        : "bg-gray-900 border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-gray-900 border border-gray-800 text-gray-300 rounded-xl text-xs disabled:opacity-40 hover:bg-gray-800 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Users;