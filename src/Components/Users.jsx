import { useState, useEffect, useCallback, useRef } from "react";

function Users() {
  // ---------- State ----------
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0); // 🆕 for server pagination
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

  // Pagination (shared across modes)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Single user detail
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // User carts
  const [userCarts, setUserCarts] = useState(null);
  const [cartsLoading, setCartsLoading] = useState(false);
  const [cartsError, setCartsError] = useState(null);
  const [showCarts, setShowCarts] = useState(false);

  // ---------- Modal state for Add / Edit ----------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState(null);

  // Ref for filter value input
  const valueInputRef = useRef(null);

  // Ref to keep latest users list for use in callbacks
  const usersRef = useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

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

  // ---------- Select fields for list ----------
  const SELECT_FIELDS = "id,firstName,lastName,age,email,phone,username,role,image";

  // ---------- Fetch users (server‑side pagination) ----------
  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      let url = `https://dummyjson.com/users?limit=${itemsPerPage}&skip=${(page - 1) * itemsPerPage}&select=${SELECT_FIELDS}`;
      if (sortBy && order) {
        url += `&sortBy=${sortBy}&order=${order}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [sortBy, order, itemsPerPage]);

  // Fetch when sort or page changes
  useEffect(() => {
    fetchUsers(currentPage);
  }, [fetchUsers, currentPage]);

  // ---------- Search (client‑side pagination) ----------
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
        const apiUsers = data.users || [];

        // Local client‑side search on the current users list
        const localUsers = usersRef.current.filter((u) =>
          u.firstName?.toLowerCase().includes(trimmed.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(trimmed.toLowerCase()) ||
          u.email?.toLowerCase().includes(trimmed.toLowerCase()) ||
          u.username?.toLowerCase().includes(trimmed.toLowerCase())
        );

        // Merge: API users first, then local users not already present
        const apiIds = new Set(apiUsers.map((u) => u.id));
        const combined = [...apiUsers];
        for (const localUser of localUsers) {
          if (!apiIds.has(localUser.id)) {
            combined.push(localUser);
          }
        }

        // Remove any user that is no longer in the main users list (e.g., deleted)
        const currentIds = new Set(usersRef.current.map((u) => u.id));
        const finalResults = combined.filter((u) => currentIds.has(u.id));

        // Apply sorting if any
        if (sortBy && order) {
          finalResults.sort((a, b) => {
            let valA = a[sortBy] ?? "";
            let valB = b[sortBy] ?? "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }

        setSearchedUsers(finalResults);
      } catch (err) {
        setSearchError(err.message || "Search failed");
        setSearchedUsers([]);
      } finally {
        setIsSearching(false);
      }
    },
    [sortBy, order]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchUsers]);

  // ---------- Filter (client‑side pagination) ----------
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
        let apiUsers = data.users || [];

        // Local client‑side filter on the current users list
        const localUsers = usersRef.current.filter((u) => {
          let val;
          if (key.includes('.')) {
            const parts = key.split('.');
            val = parts.reduce((obj, k) => obj?.[k], u);
          } else {
            val = u[key];
          }
          return String(val).toLowerCase() === value.toLowerCase();
        });

        // Merge: API users first, then local users not already present
        const apiIds = new Set(apiUsers.map((u) => u.id));
        const combined = [...apiUsers];
        for (const localUser of localUsers) {
          if (!apiIds.has(localUser.id)) {
            combined.push(localUser);
          }
        }

        // Remove any user that is no longer in the main users list
        const currentIds = new Set(usersRef.current.map((u) => u.id));
        let finalResults = combined.filter((u) => currentIds.has(u.id));

        // Apply sorting if any
        if (sortBy && order) {
          finalResults.sort((a, b) => {
            let valA = a[sortBy] ?? "";
            let valB = b[sortBy] ?? "";
            if (typeof valA === "string") valA = valA.toLowerCase();
            if (typeof valB === "string") valB = valB.toLowerCase();
            if (valA < valB) return order === "asc" ? -1 : 1;
            if (valA > valB) return order === "asc" ? 1 : -1;
            return 0;
          });
        }

        setFilteredUsers(finalResults);
      } catch (err) {
        setFilterError(err.message || "Filter failed");
        setFilteredUsers([]);
      } finally {
        setIsFiltering(false);
      }
    },
    [sortBy, order]
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

  // 🆕 For total pages: server total for main, client length for search/filter
  let totalItems = totalUsers;

  if (filterKey && filterValue) {
    displayUsers = filteredUsers;
    isDisplayLoading = isFiltering;
    displayError = filterError;
    totalItems = displayUsers.length; // client‑side total
  } else if (searchTerm.trim()) {
    displayUsers = searchedUsers;
    isDisplayLoading = isSearching;
    displayError = searchError;
    totalItems = displayUsers.length; // client‑side total
  }

  // ---------- Fetch single user detail ----------
  useEffect(() => {
    if (selectedUserId === null) {
      setSelectedUser(null);
      setDetailError(null);
      setShowCarts(false);
      return;
    }

    const fetchUserDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);
        const res = await fetch(
          `https://dummyjson.com/users/${selectedUserId}`
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

  // ---------- Fetch user carts ----------
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
  const totalPages = Math.min(Math.ceil(totalItems / itemsPerPage), 10);
  // For client‑side modes, we slice displayUsers; for main, users is already paginated from server.
  // But we keep slicing for consistency (main users length will be <= itemsPerPage).
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = displayUsers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ---------- Handlers for CRUD operations ----------
  const handleUserClick = (userId) => {
    setSelectedUserId(userId);
  };

  const handleBackToList = () => {
    setSelectedUserId(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // reset page on new search
    if (filterKey && filterValue) {
      setFilterKey("");
      setFilterValue("");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchedUsers([]);
    setSearchError(null);
    setCurrentPage(1);
  };

  const handleFilterKeyChange = (e) => {
    setFilterKey(e.target.value);
    setFilterValue("");
    setCurrentPage(1);
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
    setCurrentPage(1);
  };

  const handleSortOptionChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1); // reset page when sorting changes
  };

  const toggleCarts = () => {
    setShowCarts((prev) => !prev);
  };

  // ---------- Modal handlers ----------
  const openAddModal = () => {
    setEditingUserId(null);
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    });
    setMutationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      phone: user.phone,
      username: user.username,
      password: "",
    });
    setMutationError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({
      firstName: "",
      lastName: "",
      age: "",
      email: "",
      phone: "",
      username: "",
      password: "",
    });
    setMutationError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------- Submit Add / Update ----------
  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setMutationLoading(true);
    setMutationError(null);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: parseInt(formData.age) || 0,
        email: formData.email,
        phone: formData.phone,
        username: formData.username,
        password: formData.password || "dummy123",
      };

      let url, method;
      if (editingUserId) {
        url = `https://dummyjson.com/users/${editingUserId}`;
        method = "PUT";
        delete payload.password;
      } else {
        url = "https://dummyjson.com/users/add";
        method = "POST";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const result = await res.json();
      console.log("User saved:", result);

      if (editingUserId) {
        setUsers((prev) => prev.map((u) => (u.id === result.id ? result : u)));
      } else {
        setUsers((prev) => [result, ...prev]);
        // Increase totalUsers count for pagination (if not searching/filtering)
        setTotalUsers((prev) => prev + 1);
      }

      closeModal();
    } catch (err) {
      setMutationError(err.message || "Failed to save user");
    } finally {
      setMutationLoading(false);
    }
  };

  // ---------- Delete user ----------
  const handleDeleteUser = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) {
      return;
    }

    try {
      setMutationLoading(true);
      const res = await fetch(`https://dummyjson.com/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const result = await res.json();
      console.log("Deleted user:", result);

      // Remove from main list
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTotalUsers((prev) => Math.max(prev - 1, 0));
      // Also clean up search & filter results
      setSearchedUsers((prev) => prev.filter((u) => u.id !== userId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== userId));

      if (selectedUserId === userId) {
        handleBackToList();
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setMutationLoading(false);
    }
  };

  const currentFilterLabel =
    filterKeys.find((k) => k.value === filterKey)?.label || filterKey;
  const currentFilterExamples =
    filterKeys.find((k) => k.value === filterKey)?.examples || "";

  // ---------- Loading & Error for list ----------
  if (loading && !users.length && !searchTerm && !filterKey) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-3 text-sm text-gray-400">Loading users...</p>
      </div>
    );
  }

  if (error && !users.length) {
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

          {/* Carts Button */}
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
      {/* Top bar: heading + Add button + controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Manage User Accounts</h2>
          <button
            onClick={openAddModal}
            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-sm rounded-xl transition border border-emerald-500/30 flex items-center gap-1"
          >
            <span>+</span> Add User
          </button>
        </div>
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

      {/* Active filters/search info */}
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
                {/* Action buttons */}
                <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-blue-400 text-xs font-medium hover:underline">
                    View Profile →
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(user);
                      }}
                      className="text-xs text-yellow-400 hover:text-yellow-300 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
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

      {/* ---------- Modal for Add / Edit ---------- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white mb-4">
              {editingUserId ? "Edit User" : "Add New User"}
            </h3>
            {mutationError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm mb-4">
                {mutationError}
              </div>
            )}
            <form onSubmit={handleSubmitUser} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>
              {!editingUserId && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    placeholder="optional, default 'dummy123'"
                    className="w-full bg-gray-950 border border-gray-700 text-gray-200 text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={mutationLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-xl transition disabled:opacity-50"
                >
                  {mutationLoading ? "Saving..." : editingUserId ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-semibold py-2 rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;