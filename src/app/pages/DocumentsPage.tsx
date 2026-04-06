import { Link } from "react-router";
import { useState, useEffect } from "react";
import { 
  FileText, 
  MessageSquare, 
  Filter,
  Search,
  Download,
  Calendar,
  Building2,
  ArrowRight
} from "lucide-react";
import { documentDB, ministries } from "../data/database";
import type { Document } from "../data/database";

type DocumentStatus = 
  | "Draft" 
  | "Internal Review" 
  | "Approved for Public Review" 
  | "Public Review Open" 
  | "Public Review Closed" 
  | "Revision in Progress" 
  | "Final Approval Pending" 
  | "Published" 
  | "Archived";

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMinistry, setSelectedMinistry] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const docs = await documentDB.getAll();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  }

  const categories = ["Standards", "Regulations", "Policy", "Guidelines"];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.referenceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMinistry = selectedMinistry === "all" || doc.ministry === selectedMinistry;
    const matchesStatus = selectedStatus === "all" || doc.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    
    return matchesSearch && matchesMinistry && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Public Review Open":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Public Review Closed":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "Published":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Revision in Progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl text-center">
        <div className="text-slate-600">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Browse Documents</h1>
        <p className="text-slate-600">
          Explore laws, standards, regulations, and policies published by various ministries and authorities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, reference ID, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Building2 className="inline w-4 h-4 mr-1" />
                Ministry / Authority
              </label>
              <select
                value={selectedMinistry}
                onChange={(e) => setSelectedMinistry(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Ministries</option>
                {ministries.map(m => (
                  <option key={m.id} value={m.name}>{m.shortName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="Public Review Open">Public Review Open</option>
                <option value="Public Review Closed">Public Review Closed</option>
                <option value="Published">Published</option>
                <option value="Revision in Progress">Revision in Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-slate-600">
        Showing <span className="font-semibold text-slate-900">{filteredDocuments.length}</span> document{filteredDocuments.length !== 1 ? 's' : ''}
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                {/* Status Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                    {doc.status === "Public Review Open" && (
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                    {doc.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                    {doc.category}
                  </span>
                </div>

                {/* Title and Reference */}
                <Link to={`/documents/${doc.id}`} className="group">
                  <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {doc.title}
                  </h3>
                </Link>
                <div className="text-sm text-slate-500 mb-3">
                  Ref: {doc.referenceId} • Version {doc.version}
                </div>

                {/* Summary */}
                <p className="text-slate-600 mb-4 line-clamp-2">{doc.summary}</p>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{doc.ministry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Published {doc.publishedDate}</span>
                  </div>
                  {doc.totalComments !== undefined && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{doc.totalComments} comments</span>
                    </div>
                  )}
                </div>

                {/* Review Period */}
                {doc.status === "Public Review Open" && doc.reviewEndDate && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-900">
                        <span className="font-medium">Public review open until:</span> {doc.reviewEndDate}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex lg:flex-col gap-2">
                <Link
                  to={`/documents/${doc.id}`}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  View Details
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No documents found</h3>
            <p className="text-slate-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}