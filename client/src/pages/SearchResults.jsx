import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axio";
import JobCard from "./user/jobs/components/JobCard";
import CompanyCard from "../components/CompanyCard";
import PeopleCard from "../components/PeopleCard";
import JobFilters from "./user/jobs/components/JobFilters";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = () => {
  const query = useQuery();
  const category = query.get("category") || "Jobs";
  const search = query.get("query") || "";
  const navigate = useNavigate();
  console.log("[SearchResults] Rendered", { category, search });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const limit = 10;

  useEffect(() => {
    if (!search) return;
    setLoading(true);
    axiosInstance
      .post("/api/search", {
        query: search,
        category,
        page: 1,
        limit,
      })
      .then((res) => {
        console.log("[SearchResults API Response]", res.data);
        setResults(res.data.results);
        setTotal(res.data.total);
        setHasMore(res.data.total > limit);
        setPage(1);
      })
      .catch(() => {
        setResults([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [search, category]);

  const loadMore = () => {
    setLoading(true);
    axiosInstance
      .post("/api/search", {
        query: search,
        category,
        page: page + 1,
        limit,
      })
      .then((res) => {
        setResults((prev) => [...prev, ...res.data.results]);
        setTotal(res.data.total);
        setHasMore((page + 1) * limit < res.data.total);
        setPage((p) => p + 1);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 mt-[70px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">All Results for "{search}"</h2>
        <button
          onClick={() => navigate("/jobs")}
          className="px-4 py-2 rounded-lg bg-blue-50 text-[#1890FF] font-semibold border border-blue-200 hover:bg-blue-100 transition"
        >
          Back to Home
        </button>
      </div>
      <JobFilters category={category} />
      {loading && <div className="py-8 text-center">Loading...</div>}
      {!loading && total === 0 && (
        <div className="py-8 text-center text-gray-500">No results found.</div>
      )}
      {!loading && total > 0 && (
        <>
          <div className="text-sm text-gray-500 mb-4">
            Showing {total} result{total > 1 ? "s" : ""}
          </div>
          <div className="space-y-4">
            {results.map((item, idx) => {
              if (category === "Jobs") {
                return <JobCard key={item._id || idx} job={item} />;
              }
              if (category === "Companies") {
                return <CompanyCard key={item._id || idx} company={item} />;
              }
              if (category === "Peoples") {
                return <PeopleCard key={item._id || idx} user={item} />;
              }
              return null;
            })}
          </div>
          {hasMore && (
            <button
              className="mt-6 w-full py-2 text-blue-600 hover:underline text-sm font-semibold border-t"
              onClick={loadMore}
              disabled={loading}
            >
              Load more
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default SearchResults;
