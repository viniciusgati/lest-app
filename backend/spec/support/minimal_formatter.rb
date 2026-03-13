class MinimalFormatter
  RSpec::Core::Formatters.register self,
    :start, :example_failed, :dump_summary

  def initialize(output)
    @output = output
    @failures = []
  end

  def start(_notification)
    # silencioso no início
  end

  def example_failed(notification)
    example = notification.example
    @failures << {
      location: example.location,
      message: notification.message_lines.first&.strip
    }
  end

  def dump_summary(notification)
    passed = notification.example_count - notification.failure_count
    failed = notification.failure_count

    @output.puts "\nTests: #{passed} passed, #{failed} failed"

    if @failures.any?
      @output.puts "\nFAILED:"
      @failures.each do |f|
        @output.puts "  [backend] #{f[:location]} — #{f[:message]}"
      end
    end
  end
end
