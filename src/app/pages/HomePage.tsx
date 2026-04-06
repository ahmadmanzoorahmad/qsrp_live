import { Link } from "react-router";
import { useState, useEffect } from "react";
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Users,
  TrendingUp,
  Shield
} from "lucide-react";
import { documentDB, type Document } from "../data/database";
import { useAuth } from "../contexts/AuthContext";

export function HomePage() {
  const { user } = useAuth();
  const isStaffUser = user && user.role !== 'public';
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeReviews = documents.filter(d => d.status === "Public Review Open");
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Qanoon & Standards Review Portal
            </h1>
            <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
              A national digital platform for transparent public consultation on laws, standards, 
              and regulations. Track your feedback from submission to final decision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/documents" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
              >
                Browse Documents
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/dashboard" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors border-2 border-white/20"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { label: "Documents Published", value: "234", icon: FileText, color: "bg-blue-500" },
            { label: "Public Feedback", value: "2,847", icon: MessageSquare, color: "bg-purple-500" },
            { label: "Active Reviews", value: activeReviews.length.toString(), icon: Clock, color: "bg-orange-500" },
            { label: "Issues Resolved", value: "2,156", icon: CheckCircle2, color: "bg-emerald-500" },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Reviews Section */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Active Public Reviews</h2>
              <p className="text-slate-600">{isStaffUser ? "View submitted feedback on documents currently under public consultation" : "Submit your feedback on documents currently under public consultation"}</p>
            </div>
            <Link 
              to="/documents" 
              className="hidden md:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeReviews.slice(0, 4).map((doc) => (
              <Link
                key={doc.id}
                to={`/documents/${doc.id}`}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold mb-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      Public Review Open
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{doc.title}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{doc.summary}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{doc.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{doc.totalComments} comments</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="text-sm">
                    <span className="text-slate-500">Review closes: </span>
                    <span className="font-medium text-slate-900">{doc.reviewEndDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    {isStaffUser ? "Submitted Feedbacks" : "Submit Feedback"}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Link 
            to="/documents" 
            className="md:hidden flex items-center justify-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mt-6"
          >
            View All Documents
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-4 text-center">How It Works</h2>
            <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
              Transparent, trackable, and accountable public consultation process
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: "1",
                  icon: Search,
                  title: "Browse Documents",
                  description: "Explore draft laws, standards, and regulations open for public review"
                },
                {
                  step: "2",
                  icon: MessageSquare,
                  title: "Submit Feedback",
                  description: "Provide section-wise or full-document comments with your expertise"
                },
                {
                  step: "3",
                  icon: TrendingUp,
                  title: "Track Progress",
                  description: "Monitor your feedback through AI-powered workflow and review stages"
                },
                {
                  step: "4",
                  icon: CheckCircle2,
                  title: "Get Response",
                  description: "Receive transparent decisions with official reasoning from authorities"
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-6 h-full">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4 relative">
                      <item.icon className="w-6 h-6 text-emerald-600" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {item.step}
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "AI-Powered Classification",
                description: "Automatic categorization and routing of feedback to relevant departments with intelligent duplicate detection"
              },
              {
                icon: Clock,
                title: "SLA Tracking & Escalation",
                description: "Time-bound responses with automatic escalation if departments miss deadlines"
              },
              {
                icon: Users,
                title: "Multi-Ministry Workflow",
                description: "Coordinated review process across ministries, legal committees, and regulatory authorities"
              },
              {
                icon: TrendingUp,
                title: "Public Transparency",
                description: "Real-time dashboards showing ministry performance, response times, and consultation trends"
              },
              {
                icon: FileText,
                title: "Version Control",
                description: "Complete document history with comparison between draft and final versions"
              },
              {
                icon: MessageSquare,
                title: "Section-wise Comments",
                description: "Provide targeted feedback on specific chapters, clauses, or paragraphs"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Participate?</h2>
            <p className="text-xl text-emerald-50 mb-8">
              Login to submit feedback, track your submissions, and contribute to Pakistan's digital governance
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                Login with Google
              </button>
              <button className="px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors border-2 border-white/20">
                Login with Email
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}